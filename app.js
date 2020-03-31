require("dotenv").config({ path: ".env" });

const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = process.env.PORT;
const io = require("socket.io")(server, {
	pingTimeout: 60000
});
const redis = require("redis");
const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASS
});
const PHPUnserialize = require("php-unserialize");

const { parseCookie } = require("./utils/cookieParser");
const { userJoin, userLeave } = require("./utils/users");

server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

client.on("error", error => {
	console.log(error);
});

io.sockets.on("connection", socket => {
	loginUser(socket);

	io.on("disconnect", socket => {
		userLeave(socket);
	});
});

function loginUser(socket) {
	const cookie = socket.handshake.headers["cookie"];
	const sessionId = parseCookie(cookie);
	if (sessionId) {
		client.get(`ci_session:${sessionId}`, (err, res) => {
			if (err) throw err;
			const userData = PHPUnserialize.unserializeSession(res);
			if (userData && userData.user_id) {
				socket.user_id = userData.user_id;
				socket.username = userData.username;
				userJoin(socket.id, userData.user_id, userData.username);
			}
		});
	}
}
