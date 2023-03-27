const mongoose = require('mongoose')

const orderdatas = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  orderId:{
    type:String,
    unique:true,
    required:true,
  },
  deliveryAddress:{
    type:String,
    required:true
  },
  product:[{
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'products',
      required:true
    },
    quantity:{
      type:Number,
      required:true
    },
    Price:{
      type:Number,
      required:true
    },
    singleprodTotal:{
      type:Number,
      required:true
    }
  }],
  totalprice:{
    type:Number
  },
  total:{
    type:Number
  },
  date:{
    type:Date
  },
  discount:{
    type:Number
  },
  paymentType:{
    type:String,
    required:true
  },
  status:{
    type:String,
    default:'Confirmed'
  },
  coupon:{
    type:String,
  }
})


const order = mongoose.model('Order',orderdatas)
module.exports = order