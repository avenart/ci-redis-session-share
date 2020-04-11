const users = []

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
  userJoin,
  userLeave,
}
