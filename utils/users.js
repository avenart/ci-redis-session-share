const PHPUnserialize = require('php-unserialize')
const redis = require('redis')
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
})

const users = []

client.on('error', (error) => {
  console.log(error)
})

function parseCookie(request) {
  var result = {}
  if (request) {
    request.split(/;\s+/).forEach(function (e) {
      var parts = e.split(/=/, 2)
      result[parts[0]] = parts[1] || ''
    })
  }
  sessionId = result['ci_session'] || ''
  return sessionId
}

function authUser(socket) {
  const cookie = socket.handshake.headers['cookie']
  const sessionId = parseCookie(cookie)
  if (sessionId) {
    client.get(`ci_session:${sessionId}`, (err, res) => {
      if (err) throw err
      const userData = PHPUnserialize.unserializeSession(res)
      if (userData && userData.user_id) {
        socket.user_id = userData.user_id
        socket.username = userData.username
        return true
      }
    })
  } else {
    return false
  }
}

function userJoin({ id, user_id, username }) {
  const user = { id, user_id, username }
  console.log(`user: ${user}`)
  users.push(user)
}

function userLeave(socket) {
  const index = users.findIndex((user) => user.id === socket.id)
  if (index !== -1) {
    users.splice(index, 1)[0]
  }
}

module.exports = {
  authUser,
  userJoin,
  userLeave,
}
