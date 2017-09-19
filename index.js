/* eslint-env node */
const TelegramBot = require('node-telegram-bot-api')
const {MongoClient} = require('mongodb')
const {okTexts} = require('./src/texts')

const url = 'mongodb://localhost:27017/pmbot_v01'

const connection = async function () {
  return MongoClient.connect(url)
}

const start = async function () {
  const db = await connection()
  console.log('Connected correctly to server')
  const telegramBotToken = process.argv[2]
  if (!telegramBotToken) {
    throw new Error('Usage: node index.js YOUR_TELEGRAM_BOT_TOKEN')
  }
  const bot = new TelegramBot(telegramBotToken, {polling: true})
  console.log('Bot started')
  return {db, bot}
}

start().then(({db, bot}) => {
  bot.on('message', (msg) => onMessage(bot, db, msg).then())
})

async function onMessage (bot, db, msg) {
  await db.collection('messages').insertOne(msg)
  bot.sendMessage(msg.chat.id, okTexts[Math.floor(Math.random() * okTexts.length)])
}

