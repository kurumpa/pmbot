const {MongoClient} = require('mongodb')

const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/pmbot_v01'

let db = null
function getDb () {
  if (!db) { throw new Error('Not connected') }
  return db
}
exports.getDb = getDb

exports.connect = async function connect () {
  db = await MongoClient.connect(mongoUrl)
  console.log('Connected to MongoDB')
  return db
}

exports.saveFullMessage = async function saveFullMessage (msg) {
  return getDb().collection('messages').insertOne(msg)
}

exports.listUsers = async function listUsers () {
  return getDb().collection('messages').aggregate([{
    '$group': {
      '_id': { fromId: '$from.id', fromName: '$from.username' },
      'user': { $last: '$from' }
    }
  }]).map(g => g.user)
}

const adminId = parseInt(process.argv[3] || process.env.ROOT_ID)
exports.getAdminIds = async function getAdminIds () {
  return adminId ? [adminId] : []
}
exports.userIsAdmin = async function userIsAdmin (userId) {
  return userId === adminId
}
exports.getUserInfo = async function getUserInfo (userId) {
  const msg = await getDb().collection('messages').findOne({'from.id': userId}, {from: 1})
  return msg && msg.from
}
exports.getUserMessages = async function getUserMessages (userId) {
  return getDb().collection('messages').find({'from.id': userId})
}

exports.findMessages = async function findMessages (userId, regex) {
  return getDb().collection('messages').find({'from.id': userId, text: {$regex: regex}}, {text: 1})
}

exports.getUserSession = async function getUserSession (userId) {
  const session = await getDb().collection('sessions').findOne({userId})
  return session || {
    userId,
    lastCommand: null
  }
}

exports.saveUserSession = async function saveUserSession (session) {
  return getDb().collection('sessions').update({userId: session.userId}, session, {upsert: true})
}

