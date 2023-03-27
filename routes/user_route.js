const express = require("express")
const user_route = express()

//body parser
const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({ extended: true }))

//controller
const userController = require('../controllers/userController')

//path set
const path = require('path')

//view engine
user_route.set('view engine', 'ejs')
user_route.set('views', 'views/user')

// middileware
const auth = require('../middlewares/auth')


//get
user_route.get('/', userController.userHome)
user_route.get('/login', auth.isuserLogout, userController.userLogin)
user_route.get('/usersignup', userController.userSignup)
user_route.get('/logout', auth.isuserLogin, userController.logout)

user_route.get('/viewcart', auth.isuserLogin,userController.viewCart)
user_route.get('/deletecart/:id', auth.isuserLogin,userController.deleteCart)

user_route.get('/checkout', auth.isuserLogin,userController.viewcheckout)
user_route.get('/success', auth.isuserLogin,userController.successCheckout)
user_route.get('/viewOrder', auth.isuserLogin,userController.viewOrder)

user_route.get('/viewprofile', auth.isuserLogin,userController.userProfile)
user_route.get('/editprofile', auth.isuserLogin,userController.editProfile)

user_route.get('/address', auth.isuserLogin,userController.addressView)
user_route.get('/addAddress', auth.isuserLogin,userController.addAddress)
user_route.get('/editAddress/:id', auth.isuserLogin,userController.editAddress)
user_route.get('/removeAddress/:id', auth.isuserLogin,userController.removeAddress)
user_route.get('/changepassword', auth.isuserLogin,userController.ChangePassword)

user_route.get('/allproducts', userController.viewproducts)
user_route.get('/filter/:id', userController.filter)
user_route.get('/singleproduct/:id', userController.SingleProductLoad)

user_route.get('/wishlist', auth.isuserLogin,userController.wishlist)
user_route.get('/addtowish/:id', auth.isuserLogin,userController.addToWishlist)

user_route.get('/forgotpassword',userController.forgot)

user_route.get('/about',userController.about)

user_route.get('/search',userController.viewproducts)


//============================================================================

//post
user_route.post('/login' ,userController.loginVerify)
user_route.post('/usersignup', userController.signupVerify)
user_route.post('/verifyotp', userController.verifyOtp)

user_route.post('/change-quantity', auth.isuserLogin,userController.changeQnty)

user_route.post('/deletewish', auth.isuserLogin,userController.deletewish)

user_route.post('/editprofile/:id', auth.isuserLogin,userController.editedProfile)

user_route.post('/addAddress', auth.isuserLogin,userController.insertAddress)
user_route.post('/editAddress/:id', auth.isuserLogin,userController.editedAddress)
user_route.post('/changepassword', auth.isuserLogin,userController.changed)

user_route.post('/wishtocart', auth.isuserLogin,userController.wishtoCart)

user_route.post('/checkoutAddAddress', auth.isuserLogin,userController.addAddressToCheckout)
user_route.post('/checkout', auth.isuserLogin,userController.checkout)
user_route.post('/applyCoupon', auth.isuserLogin,userController.applyCoupon)
user_route.post('/paymentverify',auth.isuserLogin,userController.verifyPayment)

user_route.post('/cancelorder', auth.isuserLogin,userController.cancelOrder)
user_route.post('/userreturnorder',auth.isuserLogin,userController.returnOrder)

user_route.post('/search',userController.search)

user_route.post('/forgotpassword',userController.forgototp)
user_route.post('/verifyforgot',userController.verifyforgot)
user_route.post('/changePass',userController.newpass)

user_route.use(function(req,res,next){
    res.render('404page')
})
module.exports = user_route
