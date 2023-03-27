const mongoose = require('mongoose')
const addcategory = mongoose.Schema({

    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    unlist: {
        type: Boolean,
        default: false
    }
})

const category = mongoose.model('category', addcategory)
module.exports = category