const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({ //user and password schemas are no longer needed as they will now be provided by 'passportLocalMongoose'
  firstname: {
    type: String,
    defualt: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  facebookId: String
})

userSchema.plugin(passportLocalMongoose) // this plugin will provide additional authentication methods including authenticate()

module.exports = mongoose.model('User', userSchema) // collection automatically named users