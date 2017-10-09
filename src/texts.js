exports.okTexts = [
  'saved', 'note created', 'success'
]

exports.welcome = 'Hello,\n' +
  'I am a very dumb (for now) bot that memorizes all the messages you will send to help you somehow in future. ' +
  'Try typing /help to see all the things i can do at the moment\n\n' +
  'WARNING: all messages are stored unencrypted and can be analyzed manually to improve user experience'

exports.help = 'Type anything to store the message,\n' +
  '/find some text - to find messages containing "some text" \n' +
  '/findex (what|who)ever - to find messages using regular expression. ' +
  'In this case, I will find messages containing "whatever" and "whoever"'

exports.helpAdmin = exports.help + '\n\nAdmin commands:\n' +
  '/users - display known user ids\n' +
  '/userinfo userId - display user details\n' +
  '/usermessages userId - messages by user\n'
