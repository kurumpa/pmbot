const db = require('./db')
const tg = require('./tg')

exports.onUsers = async function onUsers (msg) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const users = await (await db.listUsers()).toArray()
  tg.sendMessage(msg.chat.id, users.map(u => `${u.username} (${u.id})`).join('\n'))
}
exports.onUserInfo = async function onUserInfo (msg, [_, userId]) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const user = await db.getUserInfo(parseInt(userId))
  tg.sendMessage(msg.chat.id, user ? `${JSON.stringify(user)}` : `user with id ${userId} never talked to me`)
}
exports.onUserMessages = async function onUserMessages (msg, [_, userId]) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const messages = await db.getUserMessages(parseInt(userId))
  messages.forEach(m => tg.sendMessage(msg.chat.id, JSON.stringify(m, null, 2)))
}
