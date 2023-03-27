  const mongoose = require('mongoose');

const couponDatas = new  mongoose.Schema({
    code: {
      type: String,
      required: true,
      unique: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    maxDiscount:{
        type:Number,
        required:true
    },
    MinPurchaceAmount:{
        type:Number,
        required:true
    },
    percentageOff:{
        type:Number,
        required:true,
        min:0,
        max:100  
    },
    userUsed:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      
    }
  });
  const coupon = mongoose.model('Coupon', couponDatas);
  module.exports = coupon