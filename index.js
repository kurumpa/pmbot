/* eslint-env node */
const db = require('./src/db')
const tg = require('./src/tg')
const commands = require('./src/commands')
const adminCommands = require('./src/adminCommands')

async function main () {
  const telegramBotToken = process.argv[2]
  if (!telegramBotToken) {
    throw new Error('Usage: node index.js YOUR_TELEGRAM_BOT_TOKEN')
  }

  await db.connect()
  await tg.connect(telegramBotToken)
  const adminIds = await db.getAdminIds()

  process.on('unhandledRejection', (err, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', err.stack)
    tg.sendErrorLog(adminIds, err.stack)
  })
  process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err.stack)
    tg.sendErrorLog(adminIds, err.stack)
  })

  /* eslint-disable no-multi-spaces */
  chain(tg.getBot())
    .on('message',                  commands.onAnyMessage)
    .onText(/\/start/,              commands.onStart)
    .onText(/\/help/,               commands.onHelp)
    .onText(/\/find (.+)/,          commands.onFind)
    .onText(/\/findex (.+)/,        commands.onFindEx)
    .onText(/\/users/,              adminCommands.onUsers)
    .onText(/\/userinfo (\d+)/,     adminCommands.onUserInfo)
    .onText(/\/usermessages (\d+)/, adminCommands.onUserMessages)
  /* eslint-enable no-multi-spaces */

  adminIds.forEach(id => tg.sendMessage(id, 'Bot restarted'))
}

function chain (bot) {
  return ['on', 'onText'].reduce((acc, curr) => {
    acc[curr] = (...args) => { bot[curr](...args); return acc }
    return acc
  }, {value: () => bot})
}

main().then()
