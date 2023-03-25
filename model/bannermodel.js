const mongoose = require('mongoose')
const banner = mongoose.Schema({
   description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    url:{
      type:String,
    },
})
module.exports = mongoose.model('banner', banner)