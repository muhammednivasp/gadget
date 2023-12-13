//schema
const userdatas = require('../model/userdata1')
const bcrypt = require('bcrypt')
const product = require('../model/product')
const categories = require('../model/addcategory')
const Swal = require('sweetalert2')
const MongoClient = require('mongodb').MongoClient;
const orderdatas = require("../model/orderdatas1")
const couponData = require('../model/coupon')

const { json } = require('body-parser');

const { v4: uuidv4 } = require("uuid")
const moment = require("moment")

require('dotenv').config();
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authtoken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid, authtoken);


var crypto = require("crypto");
const Razorpay = require('razorpay');


var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

const { ObjectId } = require('mongodb');
const { response } = require('../routes/user_route');
const { updateOne } = require('../model/userdata1');
const userdata = require('../model/userdata1');
const bannerdatas = require('../model/bannermodel')
const { log } = require('console')

var totalprice = 0

let session
//=================================================================================================================================================================


//login view
const userLogin = async (req, res) => {
  try {
    if (req.session.user) {

      res.redirect('/')
    } else {
      res.render('userlogin')
    }

  } catch (error) {
    res.render('error', { message: error.message })

  }
}

//===========================================================================================================================================================

// home
const userHome = async (req, res) => {
  try {
    const productDetails = await product.find({}).populate('category').limit(3)
    const categoryDetails = await categories.find({})
    const banner = await bannerdatas.find({})
    if (productDetails) {
      if (req.session.user) {
        const userdatas = req.session.user
        res.render('userhome', { userdata: userdatas, product: productDetails, categories: categoryDetails, bannerdata: banner })
      } else {
        let userdatas
        res.render('userhome', { userdata: userdatas, product: productDetails, categories: categoryDetails, bannerdata: banner })
      }

    }

  } catch (error) {
    res.render('error', { message: error.message })
  }

}

//==========================================================================================================================================================

//signup view
const userSignup = async (req, res) => {
  try {
    res.render('usersignup')
  }
  catch (error) {
    res.render('error', { message: error.message })
  }
}


//================================================================================================================================================================

// verify login
const loginVerify = async (req, res) => {
  try {

    const userdata = await userdatas.findOne({ email: req.body.email })
    if (userdata) {
      let checkpassword = await bcrypt.compare(req.body.password, userdata.password)

      if (checkpassword) {
        if (userdata.status === true) {
          res.render('userlogin', { message: 'blocked Id' })
        }
        else {
          req.session.user = userdata
          res.redirect('/')
        }
      } else {
        res.render('userlogin', { message: 'incorrect password' })
      }
    } else {
      res.render('userlogin', { message: 'Incorrect email Id' })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//=========================================================================================

//signup verify
const signupVerify = async (req, res) => {
  const {
    username, email, phonenumber, password
  } = req.body
  if (username.trim() == "" || email.trim() == "" || phonenumber.trim() == "" || password.trim() == "") {
    res.render('usersignup', { message: "All fields are required" });
  } else {
    req.session.userset = req.body
    const found = await userdatas.findOne({ email: req.body.email })
    if (found) {
      res.render('usersignup', { message: "email already exist ,try another" });
    } else {
      let phonenumber = req.body.phonenumber;
      try {

        const otpResponse = await client.verify.v2
          .services('VAf8bed4d89c34b1735d2a1b82c4e619d7')
          .verifications.create({
            to: `+91${phonenumber}`,
            channel: 'sms',
          });
        res.render('otp')

      } catch (error) {
        res.render('error', { message: error.message })
      }
    }
  }
}

//logout
const logout = async (req, res) => {
  try {
    req.session.user = null
    res.redirect('/')
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//============================================================================================================================================================

//verifying otp
const verifyOtp = async (req, res, next) => {
  const otp = req.body.otp;
  try {
    const details = req.session.userset;
    const verifiedResponse = await client.verify.v2
      .services('VAf8bed4d89c34b1735d2a1b82c4e619d7')
      .verificationChecks.create({
        to: `+91${details.phonenumber}`,
        code: otp,
      })
    if (verifiedResponse.status === 'approved') {
      details.password = await bcrypt.hash(details.password, 10)
      const userdata = new userdatas({
        username: details.username,
        email: details.email,
        phonenumber: details.phonenumber,
        password: details.password,

      })
      const user = await userdata.save();
      if (user) {
        req.session.user = details
        res.redirect('/login');
      } else {
        res.render('otp', { message: "wrong otp" })
      }

    } else {
      res.render('otp', { message: "wrong otp" })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}
//==============================================================================================================================================================

//view cart
const viewCart = async (req, res) => {
  try {

    const id = req.session.user._id;

    const user = await userdatas.findOne({ _id: id }).populate('cart.product')

    res.render('cart', { userdata: user })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//add to cart from wishlist
const wishtoCart = async (req, res) => {
  try {
    const productId = req.body.id;
    const price = req.body.price;

    const userId = req.session.user._id;
    const user = await userdatas.findById(userId);


    const found = await userdatas.findOne({ _id: userId, "cart.product": productId })
    if (found) {
      res.json({ failed: true });
    } else {
      const productDetails = await product.findById(productId);
      user.cart.push({
        product: productId,
        quantity: 1,
        productTotalPrice: productDetails.price
      });
      await userdatas.updateOne({ _id: userId }, { $pull: { wishlist: { product: productId } } })

      await user.save();

      const cartTotalPrice = user.cart.reduce((acc, item) => acc + item.productTotalPrice, 0);
      await userdatas.updateOne({ _id: userId }, { $set: { carttotalprice: cartTotalPrice } });

      res.json({ success: true });
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};


//delete cart product
const deleteCart = async (req, res) => {
  try {

    id = req.params.id
    const userid = req.session.user._id;
    const user = await userdatas.findOne({ _id: userid }).populate('cart.product')
    const deleted = await userdatas.updateOne({ _id: userid }, { $pull: { cart: { product: id } } })

    const cart = await userdatas.findOne({ _id: req.session.user._id })
    let sum = 0
    for (let i = 0; i < cart.cart.length; i++) {
      sum = sum + cart.cart[i].productTotalPrice
    }
    const updated = await userdatas.updateOne({ _id: req.session.user._id }, { $set: { carttotalprice: sum } })

    res.redirect('/viewcart')
  } catch (error) {
    res.render('error', { message: error.message })
  }
}


// change quantity
const changeQnty = async (req, res) => {
  try {
    const { prodId, count, price, qnty } = req.body
    const found = await product.findOne({ _id: prodId })
    if (found.stock > qnty || count == -1) {

      await userdatas.updateOne({ _id: req.session.user._id, "cart.product": prodId }, { $inc: { "cart.$.quantity": count } })

      const quantity = await userdatas.findOne({ _id: req.session.user._id, "cart.product": prodId }, { _id: 0, "cart.quantity.$": 1 });

      const qnty = quantity.cart[0].quantity
      const prodsingleprice = price * qnty
      await userdatas.updateOne({ _id: req.session.user._id, 'cart.product': prodId }, { $set: { "cart.$.productTotalPrice": prodsingleprice } })

      const cart = await userdatas.findOne({ _id: req.session.user._id })
      let sum = 0
      for (let i = 0; i < cart.cart.length; i++) {
        sum = sum + cart.cart[i].productTotalPrice
      }
      const updated = await userdatas.updateOne({ _id: req.session.user._id }, { $set: { carttotalprice: sum } })

      res.json({ success: true, prodsingleprice, sum })
    } else {
      res.json({ stock: true })
    }

  } catch (error) {
    res.render('error', { message: error.message })
  }
};

//==========================================================================================================================================================

const viewcheckout = async (req, res) => {
  try {
    id = req.session.user._id
    const user = await userdatas.findOne({ _id: id }).populate('cart.product')
    res.render('checkout', { userdata: user })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}



const addAddressToCheckout = async (req, res) => {
  try {
    const id = req.session.user._id
    const addresss = await userdatas.updateOne({ _id: id }, {
      $push: {
        address: {
          name: req.body.name,
          houseName: req.body.hname,
          street: req.body.street,
          district: req.body.district,
          country: req.body.country,
          state: req.body.state,
          pincode: req.body.pincode,
          phone: req.body.number
        }
      }
    })
    if (addresss) {
      res.json({ success: true })
    }

  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//checkout
const checkout = async (req, res) => {
  try {
    let flag = 0
    id = req.session.user._id
    let method = req.body.test
    const address = req.body.address

    if (address == "select address") {
      res.json({ address: true })
    } else {
      const orders = req.body
      const orderDat = []
      orders.product = orderDat
      if (!Array.isArray(orders.proId)) {
        orders.proId = [orders.proId]
      }
      if (!Array.isArray(orders.proQ)) {
        orders.proQ = [orders.proQ]
      }
      if (!Array.isArray(orders.singlePrice)) {
        orders.singlePrice = [orders.singlePrice]
      }
      if (!Array.isArray(orders.qntyPrice)) {
        orders.qntyPrice = [orders.qntyPrice]
      }
      for (let i = 0; i < orders.proId.length; i++) {
        let prod = await product.findOne({ _id: orders.proId[i] })
        if (prod.stock < orders.proQ[i]) {
          flag = 1
          break;
        }
      }
      if (flag == 0) {
        for (let i = 0; i < orders.proId.length; i++) {
          const prodId = orders.proId[i]
          const quantity = orders.proQ[i]
          const singleprice = orders.singlePrice[i]
          const singleTotal = orders.qntyPrice[i]

          orderDat.push({
            productId: prodId,
            quantity: quantity,
            Price: singleprice,
            singleprodTotal: singleTotal

          })
        }

        if (method == "COD") {
          const order = new orderdatas({
            userId: req.body.userId,
            product: orders.product,
            totalprice: req.body.total,
            total: req.body.total1,
            date: Date.now(),
            deliveryAddress: orders.address,
            paymentType: method,
            orderId: `order_id_${uuidv4()}`,
            discount: req.body.discount1,
            coupon: req.body.code
          })
          const save = await order.save()
          await couponData.updateOne({ code: req.body.code }, { $push: { userUsed: id } })

          res.json({ status: true })

        } else if (method == "UPI") {

          const order = new orderdatas({
            userId: req.body.userId,
            product: orders.product,
            totalprice: req.body.total,
            total: req.body.total1,
            date: Date.now(),
            deliveryAddress: orders.address,
            paymentType: method,
            orderId: `order_id_${uuidv4()}`,
            discount: req.body.discount1,
            coupon: req.body.code,
            status: "Failed"
          })
          const save = await order.save()
          await couponData.updateOne({ code: req.body.code }, { $push: { userUsed: id } })

          const latestOrder = await orderdatas.findOne({}).sort({ date: -1 }).lean()

          let options = {
            amount: req.body.total1 * 100,
            currency: "INR",
            receipt: "" + latestOrder._id
          };
          instance.orders.create(options, function (err, order) {
            res.json({ razorPayment: true, order })
          })



        } else if (method == "WALLET") {

          const user = await userdatas.findOne({ _id: id })
          const total = req.body.total1
          if (user.wallet >= total) {
            const order = new orderdatas({
              userId: req.body.userId,
              product: orders.product,
              totalprice: req.body.total,
              total: req.body.total1,
              date: Date.now(),
              deliveryAddress: orders.address,
              paymentType: method,
              orderId: `order_id_${uuidv4()}`,
              discount: req.body.discount1,
              coupon: req.body.code,
            })
            await userdatas.updateOne({ _id: id }, { $inc: { wallet: -total } })
            await couponData.updateOne({ code: req.body.code }, { $push: { userUsed: id } })
            const save = await order.save()

            res.json({ status: true })

          } else {
            res.json({ insufficient: true })
          }

        } else {
          res.json({ radio: true })
        }
      } else {
        res.json({ stock: true })
      }
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}


//verify payment
const verifyPayment = async (req, res) => {

  try {
    const details = req.body
    const latestOrder = await orderdatas.findOne({}).sort({ date: -1 }).lean()
    const orderid = latestOrder.orderId

    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
    hmac.update(
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id
    );
    hmac = hmac.digest('hex');
    if (hmac == details.payment.razorpay_signature) {
      await orderdatas.updateOne({ orderId: orderid }, { $set: { status: "Confirmed" } })
      res.json({ status: true })
    } else {
      await orderdatas.updateOne({ orderId: orderid }, { $set: { status: "Failed" } })
      res.json({ failed: true })
    }

  } catch (error) {
    res.render('error', { message: error.message })
  }
}


//apply coupon
const applyCoupon = async (req, res) => {
  try {
    const {
      code,
      total,
    } = req.body
    const Code = code.toUpperCase()
    const id = req.session.user._id

    const coupon = await couponData.findOne({ code: Code })
    if (coupon) {
      const used = await couponData.findOne({ code: Code, userUsed: { $in: [id] } })
      const tdyDate = Date.now()
      if (used) {
        res.json({ used: true })
      } else {
        if (tdyDate <= coupon.expirationDate) {
          if (coupon.MinPurchaceAmount <= total) {
            let discount1 = total * (coupon.percentageOff) / 100
            if (discount1 > coupon.maxDiscount) {

              let discount = coupon.maxDiscount
              let priceTotal = (total - discount)
              res.json({ final: true, priceTotal, discount, Code })
            } else {
              let discount = discount1
              let priceTotal = (total - discount)
              res.json({ final: true, priceTotal, discount, Code })
            }
          } else {
            res.json({ finalnot: true })
          }
        } else {
          res.json({ dateexpr: true })
        }

      }
    } else {
      res.json({ invalid: true })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}



//success 
const successCheckout = async (req, res, next) => {
  try {
    const userdetails = await userdatas.findOne({ _id: req.session.user._id })

    const removing = await userdatas.updateOne({ _id: req.session.user._id }, {
      $set: { cart: [] }

    })
    const ctotal = await userdatas.updateOne({ _id: req.session.user._id }, { $set: { carttotalprice: 0 } });
    const latestOrder = await orderdatas
      .findOne({})
      .sort({ date: -1 })
      .lean();

    const order = await orderdatas.findOne({ _id: latestOrder._id }).populate('product.productId')
    for (let i = 0; i < latestOrder.product.length; i++) {
      await product.updateOne({ _id: latestOrder.product[i].productId }, { $inc: { stock: -latestOrder.product[i].quantity } })
    }

    res.render('successpage', { userdata: userdetails, order: order, moment: moment })

  } catch {
    res.render('error', { message: error.message })
  }
}

//view orders
const viewOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 6
    const countorders = await orderdatas.find({}).countDocuments()
    let countdata = Math.ceil(countorders / limit)
    const order = await orderdatas.find({}).populate('product.productId').limit(limit * 1).skip((page - 1) * limit).sort({ date: -1 }).exec()

    const id = req.session.user._id
    const userdetails = await userdatas.findOne({ _id: id });
    res.render('vieworders',
      {
        userdata: userdetails,
        order: order,
        countdata,
        page
      })

  } catch (error) {
    res.render('error', { message: error.message })
  }

}

//cancel order
const cancelOrder = async (req, res) => {
  try {
    Id = req.body.id
    await orderdatas.updateOne({ _id: Id }, { $set: { status: "Cancelled" } })
    const order = await orderdatas.findOne({ _id: Id }).populate('product.productId')
    if (order.paymentType == "UPI" || order.paymentType == "WALLET") {
      await userdatas.updateOne({ _id: req.session.user._id }, { $inc: { wallet: order.total } })
    }
    for (let i = 0; i < order.product.length; i++) {
      await product.updateOne({ _id: order.product[i].productId }, { $inc: { stock: order.product[i].quantity } })
    }
    res.json({ success: true })

  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//return order
const returnOrder = async (req, res) => {
  try {

    let id = req.body.id
    const orderData = await orderdatas.updateOne({ _id: id }, { $set: { status: "Return requested" } })

    res.json({ success: true })
  } catch (error) {
    res.render('error', { message: error.message })

  }
}
//================================================================================================================================================================


//userprofile
const userProfile = async (req, res) => {
  try {
    const id = req.session.user._id

    const userdetails = await userdatas.findOne({ _id: id })
    res.render('userprofile', { userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//edit profile details
const editProfile = async (req, res) => {
  try {
    const id = req.session.user._id;

    const userdetails = await userdatas.findOne({ _id: id })
    res.render('editprofile', { userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}


//profile edit insert
const editedProfile = async (req, res) => {
  try {
    const id = req.session.user._id;
    const userdata = await userdatas.findOne({ _id: id })
    const found = await userdatas.findOne({ email: req.body.email })

    if (found && found._id != id) {
      const userdata = await userdatas.findOne({ _id: id })
      res.render('editprofile', { userdata: userdata, message: 'email Already exist. Try another' })

    } else {
      const update = await userdatas.updateOne({ _id: req.session.user._id }, {
        $set: {
          username: req.body.username,
          email: req.body.email,

        }
      })
      res.redirect('/viewprofile')
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}


//address view
const addressView = async (req, res) => {
  try {
    const id = req.session.user._id
    const userdetails = await userdatas.findOne({ _id: id })
    res.render('address', { userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//add address
const addAddress = async (req, res) => {
  try {
    const userdetails = req.session.user;

    res.render('addAddress', { userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//insert address
const insertAddress = async (req, res) => {
  try {
    const id = req.session.user._id
    const addressinserted = await userdatas.updateOne({ _id: id }, {
      $push: {
        address: {
          name: req.body.name,
          houseName: req.body.hname,
          street: req.body.street,
          district: req.body.district,
          country: req.body.country,
          state: req.body.state,
          pincode: req.body.pincode,
          phone: req.body.number
        }
      }
    })
    res.redirect('/address')
  } catch (error) {
    res.render('error', { message: error.message })
  }
}



//edit address
const editAddress = async (req, res) => {
  try {
    const id = req.params.id
    const userid = req.session.user._id
    const edit = await userdatas.findOne({ _id: userid, "address._id": id }, { "address.$": 1 })
    const userdetails = req.session.user;
    res.render('editAddress', { edit: edit, userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//edited address
const editedAddress = async (req, res) => {
  try {
    id = req.params.id;
    const setedited = await userdatas.updateOne({ _id: req.session.user._id, "address._id": id },
      {
        $set: {
          "address.$": req.body
        }
      })
    res.redirect('/address')
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//remove address
const removeAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const userid = req.session.user._id
    const removeinserted = await userdatas.updateOne({ _id: userid }, {
      $pull: {
        address: {
          _id: id
        }
      }
    })
    res.redirect('/address')

  } catch (error) {
    res.render('error', { message: error.message })
  }

}

//change password load
const ChangePassword = async (req, res) => {
  try {
    const id = req.session.user._id
    const userdetails = await userdatas.findOne({ _id: id })

    res.render('changepassword', { userdata: userdetails })
  } catch (error) {
    res.render('error', { message: error.message })

  }
}

//change password post
const changed = async (req, res) => {
  try {
    const user = await userdatas.findOne({ _id: req.session.user._id })
    const old = req.body.old
    const compared = await bcrypt.compare(old, user.password)
    if (compared) {
      if (req.body.new == req.body.confirm) {
        const New = req.body.new
        const changed = await bcrypt.hash(New, 10)
        const saving = await userdatas.updateOne({ _id: user._id }, { $set: { password: changed } })

        res.redirect('/viewprofile')
      } else {
        const userdetails = await userdatas.findOne({ _id: user._id })
        res.render('changepassword', { userdata: userdetails, message2: 'password change failed' })
      }

    } else {
      const userdetails = await userdatas.findOne({ _id: user._id })
      res.render('changepassword', { userdata: userdetails, message: 'Incorrect Password' })
    }
  } catch (error) {
    res.render('error', { message: error.message })

  }
}

//===================================================================================================================================================================

//all products
const viewproducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 4
    const countproducts = await product.find({}).countDocuments()
    let countdata = Math.ceil(countproducts / limit)
    const products = await product.find({}).populate('category').limit(limit * 1).skip((page - 1) * limit).exec()
    const result = null
    const id = null
    if (req.session.user) {
      const cat = await categories.find({})
      const user = await userdatas.findOne({ _id: req.session.user._id })

      res.render('allproducts', { product: products, userdata: user, categories: cat, countdata, page, id, result })
    } else {
      const cat = await categories.find({})

      res.render('allproducts', { product: products, categories: cat, countdata, page, id, result })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//filter
const filter = async (req, res) => {
  try {
    id = req.params.id
    if (req.session.user) {
      if (req.query.result) {
        const result = req.query.result
        const cat = await categories.find({})
        const userdata = await userdatas.findOne({ _id: req.session.user._id })
        const prod = await product.find({ category: id, productname: result }).populate('category')
        res.render('allproducts', { product: prod, userdata: userdata, categories: cat })
      } else {
        const cat = await categories.find({})
        const userdata = await userdatas.findOne({ _id: req.session.user._id })
        const prod = await product.find({ category: id }).populate('category')
        res.render('allproducts', { product: prod, userdata: userdata, categories: cat, id })
      }
    } else {
      if (req.query.result) {
        const result = req.query.result
        const cat = await categories.find({})
        const prod = await product.find({ category: id, productname: result }).populate('category')
        res.render('allproducts', { product: prod, categories: cat })
      } else {
        const cat = await categories.find({})
        const prod = await product.find({ category: id }).populate('category')
        res.render('allproducts', { product: prod, categories: cat, id })
      }
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//search
const search = async (req, res) => {
  try {
    if (req.session.user) {
      if (req.query.dataId) {
        const categ = req.query.dataId
        const input = req.body.searched[0]
        const result = new RegExp(input, 'i')
        const prod = await product.find({ productname: result, category: categ }).populate('category')
        const userdata = await userdatas.findOne({ _id: req.session.user._id })
        const cat = await categories.find({})
        res.render('allproducts', { product: prod, userdata: userdata, categories: cat })
      } else {
        const input = req.body.searched[0]
        const result = new RegExp(input, 'i')
        const prod = await product.find({ productname: result }).populate('category')
        const userdata = await userdatas.findOne({ _id: req.session.user._id })
        const cat = await categories.find({})
        res.render('allproducts', { product: prod, userdata: userdata, categories: cat, result })
      }
    } else {
      if (req.query.dataId) {
        const categ = req.query.dataId
        const input = req.body.searched[0]
        const result = new RegExp(input, 'i')
        const prod = await product.find({ productname: result, category: categ }).populate('category')
        const cat = await categories.find({})
        res.render('allproducts', { product: prod, categories: cat })
      } else {
        const input = req.body.searched[0]
        const result = new RegExp(input, 'i')
        const prod = await product.find({ productname: result }).populate('category')
        const cat = await categories.find({})
        res.render('allproducts', { product: prod, categories: cat, result })
      }
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//single product view
const SingleProductLoad = async (req, res, next) => {

  try {
    if (req.session.user) {
      const userdata = await userdatas.findOne({ _id: req.session.user._id })
      const id = req.params.id;
      const userdetails = req.session.user;
      const cartcheck = await userdatas.findOne({ _id: userdetails._id, 'cart.product': id }, { 'product.$': 1 })
      const categoryData = await categories.find({})
      if (cartcheck) {
        var cart = 'found'
      }
      const singleproduct = await product.find({ _id: id })

      res.render('singleview', { singleproduct: singleproduct, categoryData: categoryData, userdetails: userdetails, cartcheck: cart, userdata: userdata });
    } else {
      const categoryData = await categories.find({})
      const id = req.params.id;
      const singleproduct = await product.find({ _id: id })
      res.render('singleview', { singleproduct: singleproduct, categoryData: categoryData });
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }

}

//==============================================================================================================================================================

//wish list
const wishlist = async (req, res) => {
  try {
    const id = req.session.user._id
    const wishlistData = await userdatas.findOne({ _id: id }).populate('wishlist.product').exec()
    const categoryData = await categories.find({})
    res.render('wishlist', { userdata: wishlistData, categories: categoryData })
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//add to wish
const addToWishlist = async (req, res, next) => {
  try {
    id = req.params.id;
    const found = await userdatas.findOne({ _id: req.session.user._id, "wishlist.product": id })
    const cat = await categories.find({})
    const userdata = await userdatas.findOne({ _id: req.session.user._id })
    const products = await product.find({}).populate('category')
    if (found) {
      res.render('allproducts', { product: products, userdata: userdata, categories: cat, message: 'already exists' })
    } else {
      const userid = req.session.user._id;
      const categorydata = await categories.find({})
      const userdetails = await userdatas.findOne({ username: userid })
      const wishlistInserted = await userdatas.updateOne({ _id: userid }, { $push: { wishlist: { product: id } } })
      const wishlistData = await userdatas.findOne({ _id: userid }).populate('wishlist.product').exec()

      res.render('allproducts', { product: products, userdata: userdata, categories: cat, message2: 'added successfully' })
    }

  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//delete wish
const deletewish = async (req, res) => {
  try {
    const id = req.session.user._id
    proId = req.body.product
    const deleted = await userdatas.updateOne({ _id: id }, { $pull: { wishlist: { product: proId } } })
    res.json({ success: true })
    // }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//forgot load
const forgot = async (req, res, next) => {
  try {
    res.render('forgot')
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//forgot password
const forgototp = async (req, res, next) => {
  try {
    req.session.useotp = req.body
    const { phone, email } = req.body
    const found = await userdatas.findOne({ email: email, phonenumber: phone })
    if (found) {
      const otpResponse = await client.verify.v2
        .services('VAf8bed4d89c34b1735d2a1b82c4e619d7')
        .verifications.create({
          to: `+91${phone}`,
          channel: 'sms',
        });
      res.render('otpforgot')
    } else {
      res.render('forgot', { message: "data did'nt matched" })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

const verifyforgot = async (req, res) => {
  try {
    let otp = req.body.otp
    const details = req.session.useotp
    const verifiedResponse = await client.verify.v2
      .services('VAf8bed4d89c34b1735d2a1b82c4e619d7')
      .verificationChecks.create({
        to: `+91${details.phone}`,
        code: otp,
      })
    if (verifiedResponse.status === 'approved') {
      res.render('changepass')
    } else {
      res.render('otpforgot', { message: "wrong otp" })
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//new password set
const newpass = async (req, res) => {
  try {
    const { newp, confirm } = req.body
    if (newp !== confirm) {
      res.render('changepass', { message: "entered password is different" })
    } else {
      const password1 = await bcrypt.hash(newp, 10)
      const emailid = req.session.useotp.email
      const done = await userdatas.updateOne({ email: emailid }, { $set: { password: password1 } })
      if (done) {
        res.redirect('/login')
      } else {
        res.render('changepass', { message: "failed" })
      }
    }
  } catch (error) {
    res.render('error', { message: error.message })
  }
}

//======================================================================================================================================================

//about
const about = async (req, res) => {
  try {
    res.render('about')

  } catch (error) {
    res.render('error', { message: error.message })
  }
}

module.exports = {
  //user
  userLogin,
  userHome,
  userSignup,
  signupVerify,
  loginVerify,
  logout,
  verifyOtp,

  //cart
  viewCart,
  deleteCart,
  changeQnty,

  //poduct
  viewproducts,
  SingleProductLoad,
  filter,
  search,

  //wishlist
  wishlist,
  addToWishlist,
  deletewish,
  wishtoCart,

  //checkout
  addAddressToCheckout,

  viewcheckout,
  checkout,
  successCheckout,
  viewOrder,
  cancelOrder,
  returnOrder,
  verifyPayment,

  applyCoupon,

  //profile
  userProfile,
  editProfile,
  editedProfile,
  addressView,
  addAddress,
  insertAddress,
  editAddress,
  editedAddress,
  removeAddress,
  ChangePassword,
  changed,

  //change password
  forgot,
  forgototp,
  verifyforgot,
  newpass,

  about


}
