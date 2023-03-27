const mongoose = require('mongoose')
const admindata = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('admin', admindata)