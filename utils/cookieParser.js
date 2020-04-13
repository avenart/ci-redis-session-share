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

module.exports = { parseCookie }
