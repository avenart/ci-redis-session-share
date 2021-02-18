const users = []

function userLogin({ id, user_id, username }) {
  const user = { id, user_id, username }
  if (!users.some((el) => el.user_id === user.user_id)) users.push(user)
}

function userLogout(socket) {
  const index = users.findIndex((user) => user.id === socket.id)
  if (index !== -1) {
    users.splice(index, 1)[0]
  }
}

module.exports = {
  users,
  userLogin,
  userLogout,
}
