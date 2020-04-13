require('dotenv').config({ path: '.env' })

const express = require('express')
const app = express()
const server = require('http').Server(app)
const port = process.env.PORT
const io = require('socket.io')(server)
const PHPUnserialize = require('php-unserialize')
const redis = require('redis')
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
})
const { userJoin, userLeave } = require('./utils/users')
const { parseCookie } = require('./utils/cookieParser')

client.on('error', (error) => {
  console.log(error)
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

io.use((socket, next) => {
  const cookie = socket.handshake.headers['cookie']
  const sessionId = parseCookie(cookie)
  if (sessionId) {
    client.get(`ci_session:${sessionId}`, (err, res) => {
      if (err) throw err
      const userData = PHPUnserialize.unserializeSession(res)
      if (userData && userData.user_id) {
        socket.user_id = userData.user_id
        socket.username = userData.username
        next()
      } else {
        next(new Error('auth error'))
      }
    })
  }
}).on('connection', (socket) => {
  userJoin(socket)

  io.on('disconnect', (socket) => {
    userLeave(socket)
  })
})
