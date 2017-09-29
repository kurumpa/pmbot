const db = require('./db')
const tg = require('./tg')
const texts = require('./texts')

exports.onStart = async function onStart (msg) {
  tg.sendMessage(msg.chat.id, texts.welcome)
}

exports.onHelp = async function onStart (msg) {
  tg.sendMessage(msg.chat.id, (await db.userIsAdmin(msg.from.id)) ? texts.helpAdmin : texts.help)
}

exports.onFind = async function onFind (msg, [_, text]) {
  const messages = await db.findMessages(msg.from.id, new RegExp(text.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$&'), 'i'))
  messages.forEach(m => { if (!m.text.startsWith('/')) tg.sendMessage(msg.chat.id, m.text) })
}

exports.onFindEx = async function onFind (msg, [_, text]) {
  const messages = await db.findMessages(msg.from.id, new RegExp(text, 'i'))
  messages.forEach(m => { if (!m.text.startsWith('/')) tg.sendMessage(msg.chat.id, m.text) })
}

exports.onAnyMessage = async function onAnyMessage (msg) {
  await db.saveFullMessage(msg)
  if (msg.text && msg.text.startsWith('/')) {
    return
  }
  tg.sendMessage(msg.chat.id, texts.okTexts[Math.floor(Math.random() * texts.okTexts.length)])
}
