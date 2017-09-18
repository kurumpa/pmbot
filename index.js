/* eslint-env node */
const TelegramBot = require('node-telegram-bot-api')

const telegramBotToken = process.argv[2]
if (!telegramBotToken) {
  throw new Error('Usage: node index.js YOUR_TELEGRAM_BOT_TOKEN')
}

const bot = new TelegramBot(telegramBotToken, {polling: true})

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Received your message')
})
