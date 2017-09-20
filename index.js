/* eslint-env node */
const db = require('./src/db')
const tg = require('./src/tg')
const {okTexts} = require('./src/texts')

async function main () {
  const telegramBotToken = process.argv[2]
  if (!telegramBotToken) {
    throw new Error('Usage: node index.js YOUR_TELEGRAM_BOT_TOKEN')
  }

  await db.connect()
  await tg.connect(telegramBotToken)
  const userIds = await db.getAdminIds()

  process.on('unhandledRejection', async function (err, p) {
    console.log('Unhandled Rejection at:', p, 'reason:', err.stack)
    tg.sendErrorLog(userIds, err.stack)
  })

  chain(tg.getBot())
    .on('message', onAnyMessage)
    .onText(/\/find (.+)/, onFind)
    .onText(/\/users/, onUsers)
    .onText(/\/userinfo (\d+)/, onUserInfo)
    .onText(/\/usermessages (\d+)/, onUserMessages)

  userIds.forEach(id => tg.sendMessage(id, 'Bot restarted'))
}

function chain (bot) {
  return ['on', 'onText'].reduce((acc, curr) => {
    acc[curr] = (...args) => { bot[curr](...args); return acc }
    return acc
  }, {value: () => bot})
}

async function onFind (msg, [_, text]) {
  const messages = await db.findMessages(msg.from.id, new RegExp(text, 'i'))
  messages.forEach(m => { if (!m.text.startsWith('/')) tg.sendMessage(msg.chat.id, m.text) })
}
async function onUsers (msg) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const users = await db.listUsers()
  tg.sendMessage(msg.chat.id, users.map(u => `${u.username} (${u.id})`).join('\n'))
}
async function onUserInfo (msg, [_, userId]) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const user = await db.getUserInfo(parseInt(userId))
  tg.sendMessage(msg.chat.id, user ? `${JSON.stringify(user)}` : `user with id ${userId} never talked to me`)
}
async function onUserMessages (msg, [_, userId]) {
  if (!await db.userIsAdmin(msg.from.id)) { return }
  const messages = await db.getUserMessages(parseInt(userId))
  messages.forEach(m => tg.sendMessage(msg.chat.id, JSON.stringify(m, null, 2)))
}
async function onAnyMessage (msg) {
  await db.saveFullMessage(msg)
  if (msg.text && msg.text.startsWith('/')) {
    return
  }
  tg.sendMessage(msg.chat.id, okTexts[Math.floor(Math.random() * okTexts.length)])
}

main().then()
