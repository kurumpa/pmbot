const db = require('./db')
const tg = require('./tg')
const texts = require('./texts')

async function resetSession (msg) {
  const session = await db.getUserSession(msg.from.id)
  session.lastCommand = null
  return db.saveUserSession(session)
}

exports.onCancel = async function onCancel (msg) {
  await resetSession(msg)
  tg.sendMessage(msg.chat.id, 'Cancelled')
}

exports.onStart = async function onStart (msg) {
  tg.sendMessage(msg.chat.id, texts.welcome)
}

exports.onHelp = async function onStart (msg) {
  tg.sendMessage(msg.chat.id, (await db.userIsAdmin(msg.from.id)) ? texts.helpAdmin : texts.help)
}

exports.onBeginFind = async function onBeginFind (msg) {
  const session = await db.getUserSession(msg.from.id)
  session.lastCommand = 'find'
  await db.saveUserSession(session)
  tg.sendMessage(msg.chat.id, 'Enter text to find:')
}
exports.onFind = async function onFind (msg, [_, text]) {
  const messages = await db.findMessages(msg.from.id, new RegExp(text.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$&'), 'i'))
  messages.forEach(m => { if (!m.text.startsWith('/')) tg.sendMessage(msg.chat.id, m.text) })
  await resetSession(msg)
}

exports.onBeginFindEx = async function onBeginFindEx (msg) {
  const session = await db.getUserSession(msg.from.id)
  session.lastCommand = 'findEx'
  await db.saveUserSession(session)
  tg.sendMessage(msg.chat.id, 'Enter regular expression to find:')
}

exports.onFindEx = async function onFind (msg, [_, text]) {
  const messages = await db.findMessages(msg.from.id, new RegExp(text, 'i'))
  messages.forEach(m => { if (!m.text.startsWith('/')) tg.sendMessage(msg.chat.id, m.text) })
  await resetSession(msg)
}

exports.onAnyMessage = async function onAnyMessage (msg) {
  await db.saveFullMessage(msg)
  if (msg.text && msg.text.startsWith('/')) {
    return
  }
  const session = await db.getUserSession(msg.from.id)
  if (session.lastCommand === 'find') {
    return exports.onFind(msg, [`/find ${msg.text}`, msg.text])
  }
  if (session.lastCommand === 'findEx') {
    return exports.onFindEx(msg, [`/find ${msg.text}`, msg.text])
  }
  tg.sendMessage(msg.chat.id, texts.okTexts[Math.floor(Math.random() * texts.okTexts.length)])
}
