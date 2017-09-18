/* eslint-env node */
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const stateLocation = './data/state.json'
const dataFolder = './data'
const chatsFolder = './data/chats'
const getChatFolder = chatId => `${chatsFolder}/${chatId}`

const telegramBotToken = process.argv[2]
if (!telegramBotToken) {
  throw new Error('Usage: node index.js YOUR_TELEGRAM_BOT_TOKEN')
}

let state = loadState() || getInitialState()

const bot = new TelegramBot(telegramBotToken, {polling: true})
console.log('Started')

bot.on('polling_error', (error) => {
  console.log(error)
})

bot.on('message', (msg) => {
  const chat = getChat(state, msg.chat.id)
  dumpMsg(chat, msg.text)
})

function loadState () {
  if (!fs.existsSync(stateLocation)) {
    return null
  }
  return JSON.parse(fs.readFileSync(stateLocation, {encoding: 'utf8'}))
}
function saveState (state) {
  fs.writeFileSync(stateLocation, JSON.stringify(state))
  return state
}
function getInitialState () {
  try { fs.statSync(dataFolder) } catch (e) { fs.mkdirSync(dataFolder) }
  try { fs.statSync(chatsFolder) } catch (e) { fs.mkdirSync(chatsFolder) }
  return {chats: []}
}

function getChat (state, chatId) {
  let chat = state.chats.find(c => c.id === chatId)
  if (!chat) {
    chat = {id: chatId}
    try { fs.statSync(getChatFolder(chatId)) } catch (e) { fs.mkdirSync(getChatFolder(chatId)) }
    state.chats.push(chat)
    saveState(state)
  }
  return chat
}

function dumpMsg (chat, msg) {
  const now = new Date().toISOString()
  fs.appendFileSync(`${getChatFolder(chat.id)}/${now.substr(0, 10)}`, `${now} ${(msg || '').replace(/\n/g, '\\n')}\n`)
}
