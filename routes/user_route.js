const express = require("express")
const user_route = express()

//body parser
const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({ extended: true }))

//controller
const usercontroller = require('../controllers/usercontroller')

//path set
const path = require('path')

//view engine
user_route.set('view engine', 'ejs')
user_route.set('views', 'views/user')

// middileware
const auth = require('../middlewares/auth')


//get
user_route.get('/', usercontroller.userHome)
user_route.get('/login', auth.isuserLogout, usercontroller.userLogin)
user_route.get('/usersignup', usercontroller.userSignup)
user_route.get('/logout', auth.isuserLogin, usercontroller.logout)

user_route.get('/viewcart', auth.isuserLogin,usercontroller.viewCart)
user_route.get('/deletecart/:id', auth.isuserLogin,usercontroller.deleteCart)

user_route.get('/checkout', auth.isuserLogin,usercontroller.viewcheckout)
user_route.get('/success', auth.isuserLogin,usercontroller.successCheckout)
user_route.get('/viewOrder', auth.isuserLogin,usercontroller.viewOrder)

user_route.get('/viewprofile', auth.isuserLogin,usercontroller.userProfile)
user_route.get('/editprofile', auth.isuserLogin,usercontroller.editProfile)

user_route.get('/address', auth.isuserLogin,usercontroller.addressView)
user_route.get('/addAddress', auth.isuserLogin,usercontroller.addAddress)
user_route.get('/editAddress/:id', auth.isuserLogin,usercontroller.editAddress)
user_route.get('/removeAddress/:id', auth.isuserLogin,usercontroller.removeAddress)
user_route.get('/changepassword', auth.isuserLogin,usercontroller.ChangePassword)

user_route.get('/allproducts', usercontroller.viewproducts)
user_route.get('/filter/:id', usercontroller.filter)
user_route.get('/singleproduct/:id', usercontroller.SingleProductLoad)

user_route.get('/wishlist', auth.isuserLogin,usercontroller.wishlist)
user_route.get('/addtowish/:id', auth.isuserLogin,usercontroller.addToWishlist)

user_route.get('/forgotpassword',usercontroller.forgot)

user_route.get('/about',usercontroller.about)

user_route.get('/search',usercontroller.viewproducts)


//============================================================================

//post
user_route.post('/login' ,usercontroller.loginVerify)
user_route.post('/usersignup', usercontroller.signupVerify)
user_route.post('/verifyotp', usercontroller.verifyOtp)

user_route.post('/change-quantity', auth.isuserLogin,usercontroller.changeQnty)

user_route.post('/deletewish', auth.isuserLogin,usercontroller.deletewish)

user_route.post('/editprofile/:id', auth.isuserLogin,usercontroller.editedProfile)

user_route.post('/addAddress', auth.isuserLogin,usercontroller.insertAddress)
user_route.post('/editAddress/:id', auth.isuserLogin,usercontroller.editedAddress)
user_route.post('/changepassword', auth.isuserLogin,usercontroller.changed)

user_route.post('/wishtocart', auth.isuserLogin,usercontroller.wishtoCart)

user_route.post('/checkoutAddAddress', auth.isuserLogin,usercontroller.addAddressToCheckout)
user_route.post('/checkout', auth.isuserLogin,usercontroller.checkout)
user_route.post('/applyCoupon', auth.isuserLogin,usercontroller.applyCoupon)
user_route.post('/paymentverify',auth.isuserLogin,usercontroller.verifyPayment)

user_route.post('/cancelorder', auth.isuserLogin,usercontroller.cancelOrder)
user_route.post('/userreturnorder',auth.isuserLogin,usercontroller.returnOrder)

user_route.post('/search',usercontroller.search)

user_route.post('/forgotpassword',usercontroller.forgototp)
user_route.post('/verifyforgot',usercontroller.verifyforgot)
user_route.post('/changePass',usercontroller.newpass)

user_route.use(function(req,res,next){
    res.render('404page')
})
module.exports = user_route
