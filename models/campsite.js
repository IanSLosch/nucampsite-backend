const mongoose = require('mongoose')
const Schema = mongoose.Schema // not required, but cleans the code up
require('mongoose-currency').loadType(mongoose) // loads into mongoose, so it's available for schema's to use
const Currency = mongoose.Types.Currency

const commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }, 
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // this is a reference to user document by the user document's ObjectId
    ref: 'User' // the name of the Model we are referencing
  }
}, {
  timestamps: true
})

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }, 
    image: {
      type: String,
      required: true
    },
    elevation: {
      type: Number,
      required: true
    },
    cost: {
      type: Currency,
      required: true,
      min: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true // mongoose will add two properties to this schema - createAt and updatedAt. meaning, whenever a document is created with this schema, it will have those two porperties
})

const Campsite = mongoose.model('Campsite', campsiteSchema) // first argument should be capitalized and singular. finds/creates 'campsites/ (lowercase plural) ****confirm this****

module.exports = Campsite