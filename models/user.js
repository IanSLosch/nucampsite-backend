const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({ //user and password schemas are provided by 'passportLocalMongoose'
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  facebookId: {
    type: String,
    default: ''
  }
})

userSchema.plugin(passportLocalMongoose) // this plugin will provide additional authentication methods including authenticate()

module.exports = mongoose.model('User', userSchema) // collection automatically named users