const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({ //user and password schemas are no longer needed as they will now be provided by 'passportLocalMongoose'
  admin: {
    type: Boolean,
    default: false
  }
})

userSchema.plugin(passportLocalMongoose) // this plugin will provide additional authentication methods including authenticate()

module.exports = mongoose.model('User', userSchema) // collection automatically named users