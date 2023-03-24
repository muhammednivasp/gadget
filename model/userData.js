const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");

const userDatas = mongoose.Schema({

  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phonenumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },quantity
    : {
      type: Number,
      default: 1
    },
    productTotalPrice: {
      type: Number,
    },
  }],
  carttotalprice: {
    type: Number,
    default: 0
  },
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    }
  }],
  address: [
    {
      name: {
        type: String,
        required: true
      },
      houseName: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      phone: {
        type: Number,
        required: true
      },
    }
  ],
  wallet:{
       type:Number,
       default: 0
  }


})
module.exports = mongoose.model('user', userDatas)