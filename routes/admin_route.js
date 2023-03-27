
const express = require("express")
const admin_route = express()

//body parser
const bodyparser = require('body-parser')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({ extended: true }))

//admin controller
const admincontroller = require('../controllers/admincontroller')


const path = require('path')

const multer = require('multer')

//view engine
admin_route.set('view engine', 'ejs')
admin_route.set('views', 'views/admin')

//middileware
const auth = require('../middlewares/auth')

//images
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, '../public/images'))

    },

    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname
        cb(null, name)
    }
})
const upload = multer({ storage: storage })

//get
admin_route.get('/', auth.isLogout, admincontroller.adminLogin)

admin_route.get('/logout', auth.isLogin, admincontroller.adminLogout)

admin_route.get('/category', auth.isLogin, admincontroller.Category)
admin_route.get('/category/addcategory', auth.isLogin, admincontroller.add_category)
admin_route.get('/category/unlistcat/:id', auth.isLogin, admincontroller.listCategory)
admin_route.get('/category/editcategory/:id', auth.isLogin, admincontroller.vieweditcat)

admin_route.get('/products', auth.isLogin, admincontroller.productShow)
admin_route.get('/addproducts', auth.isLogin, admincontroller.addprodview)
admin_route.get('/products/productedit/:id', auth.isLogin, admincontroller.vieweditproduct)
admin_route.get('/products/unlist/:id', auth.isLogin, admincontroller.listProduct)

admin_route.get('/deleteimg/:imgid/:prodid',admincontroller.deleteimage)

admin_route.get('/userview', auth.isLogin, admincontroller.usersView)
admin_route.get('/userview/block/:id', auth.isLogin, admincontroller.userBlock)
admin_route.get('/userview/unblock/:id', auth.isLogin, admincontroller.unBlockuser)

admin_route.get('/coupon', auth.isLogin, admincontroller.couponview)
admin_route.get('/addCoupons', auth.isLogin, admincontroller.addcoupons)
admin_route.get('/coupon/editcoupon/:id', auth.isLogin, admincontroller.couponedit)
admin_route.get('/coupon/delete/:id', auth.isLogin, admincontroller.deletecoupon)

admin_route.get('/banners', auth.isLogin, admincontroller.bannershow)
admin_route.get('/banners/addbanners',auth.isLogin,admincontroller.addbanner)
admin_route.get('/banners/deletebanner/:id',auth.isLogin,admincontroller.deletebanner)

admin_route.get('/orders', auth.isLogin, admincontroller.orders)

admin_route.get('/dashboard',auth.isLogin,admincontroller.dashboard)
admin_route.get('/salesReport',auth.isLogin,admincontroller.sales)

//==================================================================================

//post
admin_route.post('/', admincontroller.loginVerify)

admin_route.post('/category/addcategory',auth.isLogin, admincontroller.newcategory)
admin_route.post('/category/editcategory/:id',auth.isLogin, admincontroller.EditCategory)

admin_route.post('/addproducts', upload.array("image"), admincontroller.addproduct)
admin_route.post('/products/productedit/:id', upload.array("image"), admincontroller.editproduct)

admin_route.post('/editimage/:id', upload.array("image"), admincontroller.editimg)

admin_route.post('/coupon/editcoupon/:id',auth.isLogin, admincontroller.editedcoupon)
admin_route.post('/addCoupons', auth.isLogin, admincontroller.couponadd)

admin_route.post('/orders', auth.isLogin, admincontroller.changeStatus)

admin_route.post('/banners/addBanners',auth.isLogin, upload.single("image"),admincontroller.insertbanner)

admin_route.post('/salesReport',auth.isLogin,admincontroller.salesReport)


admin_route.use(function(req,res,next){
    res.render('404')
})
module.exports = admin_route
