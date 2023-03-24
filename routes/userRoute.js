const express = require("express")
const userRoute = express()

//body parser
const bodyparser = require('body-parser')
userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({ extended: true }))

//controller
const userController = require('../controllers/userController')

//path set
const path = require('path')

//view engine
userRoute.set('view engine', 'ejs')
userRoute.set('views', 'views/user')

// middileware
const auth = require('../middlewares/auth')


//get
userRoute.get('/', userController.userHome)
userRoute.get('/login', auth.isuserLogout, userController.userLogin)
userRoute.get('/usersignup', userController.userSignup)
userRoute.get('/logout', auth.isuserLogin, userController.logout)

userRoute.get('/viewcart', auth.isuserLogin,userController.viewCart)
userRoute.get('/deletecart/:id', auth.isuserLogin,userController.deleteCart)

userRoute.get('/checkout', auth.isuserLogin,userController.viewcheckout)
userRoute.get('/success', auth.isuserLogin,userController.successCheckout)
userRoute.get('/viewOrder', auth.isuserLogin,userController.viewOrder)

userRoute.get('/viewprofile', auth.isuserLogin,userController.userProfile)
userRoute.get('/editprofile', auth.isuserLogin,userController.editProfile)

userRoute.get('/address', auth.isuserLogin,userController.addressView)
userRoute.get('/addAddress', auth.isuserLogin,userController.addAddress)
userRoute.get('/editAddress/:id', auth.isuserLogin,userController.editAddress)
userRoute.get('/removeAddress/:id', auth.isuserLogin,userController.removeAddress)
userRoute.get('/changepassword', auth.isuserLogin,userController.ChangePassword)

userRoute.get('/allproducts', userController.viewproducts)
userRoute.get('/filter/:id', userController.filter)
userRoute.get('/singleproduct/:id', userController.SingleProductLoad)

userRoute.get('/wishlist', auth.isuserLogin,userController.wishlist)
userRoute.get('/addtowish/:id', auth.isuserLogin,userController.addToWishlist)

userRoute.get('/forgotpassword',userController.forgot)

userRoute.get('/about',userController.about)



//post
userRoute.post('/login' ,userController.loginVerify)
userRoute.post('/usersignup', userController.signupVerify)
userRoute.post('/verifyotp', userController.verifyOtp)

userRoute.post('/change-quantity', auth.isuserLogin,userController.changeQnty)

userRoute.post('/deletewish', auth.isuserLogin,userController.deletewish)

userRoute.post('/editprofile/:id', auth.isuserLogin,userController.editedProfile)

userRoute.post('/addAddress', auth.isuserLogin,userController.insertAddress)
userRoute.post('/editAddress/:id', auth.isuserLogin,userController.editedAddress)
userRoute.post('/changepassword', auth.isuserLogin,userController.changed)

userRoute.post('/wishtocart', auth.isuserLogin,userController.wishtoCart)

userRoute.post('/checkoutAddAddress', auth.isuserLogin,userController.addAddressToCheckout)
userRoute.post('/checkout', auth.isuserLogin,userController.checkout)
userRoute.post('/applyCoupon', auth.isuserLogin,userController.applyCoupon)
userRoute.post('/paymentverify',auth.isuserLogin,userController.verifyPayment)

userRoute.post('/cancelorder', auth.isuserLogin,userController.cancelOrder)
userRoute.post('/userreturnorder',auth.isuserLogin,userController.returnOrder)

userRoute.post('/search',auth.isuserLogin,userController.search)

userRoute.post('/forgotpassword',userController.forgototp)
userRoute.post('/verifyforgot',userController.verifyforgot)
userRoute.post('/changePass',userController.newpass)

userRoute.use(function(req,res,next){
    res.render('404page')
})
module.exports = userRoute
