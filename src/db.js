const {MongoClient} = require('mongodb')

const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/pmbot_v01'

let db = null
function getDb () {
  if (!db) { throw new Error('Not connected') }
  return db
}

async function connect () {
  db = await MongoClient.connect(mongoUrl)
  console.log('Connected to MongoDB')
  return db
}

async function saveFullMessage (msg) {
  return getDb().collection('messages').insertOne(msg)
}

async function listUsers () {
  return getDb().collection('messages').aggregate([{
    '$group': {
      '_id': { fromId: '$from.id', fromName: '$from.username' },
      'user': { $last: '$from' }
    }
  }]).map(g => g.user)
}

const adminId = parseInt(process.argv[3] || process.env.ROOT_ID)
async function getAdminIds () {
  return adminId ? [adminId] : []
}
async function userIsAdmin (userId) {
  return userId === adminId
}
async function getUserInfo (userId) {
  const msg = await getDb().collection('messages').findOne({'from.id': userId}, {from: 1})
  return msg && msg.from
}
async function getUserMessages (userId) {
  return getDb().collection('messages').find({'from.id': userId})
}

async function findMessages (userId, regex) {
  return getDb().collection('messages').find({'from.id': userId, text: {$regex: regex}}, {text: 1})
}

module.exports = {
  getDb,
  connect,
  listUsers,
  saveFullMessage,
  userIsAdmin,
  getAdminIds,
  getUserInfo,
  getUserMessages,
  findMessages,
}
