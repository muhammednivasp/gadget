const mongoose = require('mongoose')
const admindata = new mongoose.Schema({ 
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
const admin = mongoose.model('admin', admindata);
module.exports =  admin;