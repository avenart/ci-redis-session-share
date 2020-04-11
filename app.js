require('dotenv').config({ path: '.env' })

const express = require('express')
const app = express()
const server = require('http').Server(app)
const port = process.env.PORT
const io = require('socket.io')(server, {
  pingTimeout: 60000,
})

const { authUser, userJoin, userLeave } = require('./utils/users')

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

io.use((socket, next) => {
  if (authUser(socket)) {
    next()
  } else {
    next(new Error('auth error'))
  }
}).on('connection', (socket) => {
  userJoin(socket)

  io.on('disconnect', (socket) => {
    userLeave(socket)
  })
})
