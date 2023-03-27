
const express = require("express")
const admin_route = express()

//body parser
const bodyparser = require('body-parser')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({ extended: true }))

//admin controller
const adminController = require('../controllers/adminController')


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
admin_route.get('/', auth.isLogout, adminController.adminLogin)

admin_route.get('/logout', auth.isLogin, adminController.adminLogout)

admin_route.get('/category', auth.isLogin, adminController.Category)
admin_route.get('/category/addcategory', auth.isLogin, adminController.add_category)
admin_route.get('/category/unlistcat/:id', auth.isLogin, adminController.listCategory)
admin_route.get('/category/editcategory/:id', auth.isLogin, adminController.vieweditcat)

admin_route.get('/products', auth.isLogin, adminController.productShow)
admin_route.get('/addproducts', auth.isLogin, adminController.addprodview)
admin_route.get('/products/productedit/:id', auth.isLogin, adminController.vieweditproduct)
admin_route.get('/products/unlist/:id', auth.isLogin, adminController.listProduct)

admin_route.get('/deleteimg/:imgid/:prodid',adminController.deleteimage)

admin_route.get('/userview', auth.isLogin, adminController.usersView)
admin_route.get('/userview/block/:id', auth.isLogin, adminController.userBlock)
admin_route.get('/userview/unblock/:id', auth.isLogin, adminController.unBlockuser)

admin_route.get('/coupon', auth.isLogin, adminController.couponview)
admin_route.get('/addCoupons', auth.isLogin, adminController.addcoupons)
admin_route.get('/coupon/editcoupon/:id', auth.isLogin, adminController.couponedit)
admin_route.get('/coupon/delete/:id', auth.isLogin, adminController.deletecoupon)

admin_route.get('/banners', auth.isLogin, adminController.bannershow)
admin_route.get('/banners/addbanners',auth.isLogin,adminController.addbanner)
admin_route.get('/banners/deletebanner/:id',auth.isLogin,adminController.deletebanner)

admin_route.get('/orders', auth.isLogin, adminController.orders)

admin_route.get('/dashboard',auth.isLogin,adminController.dashboard)
admin_route.get('/salesReport',auth.isLogin,adminController.sales)

//==================================================================================

//post
admin_route.post('/', adminController.loginVerify)

admin_route.post('/category/addcategory',auth.isLogin, adminController.newcategory)
admin_route.post('/category/editcategory/:id',auth.isLogin, adminController.EditCategory)

admin_route.post('/addproducts', upload.array("image"), adminController.addproduct)
admin_route.post('/products/productedit/:id', upload.array("image"), adminController.editproduct)

admin_route.post('/editimage/:id', upload.array("image"), adminController.editimg)

admin_route.post('/coupon/editcoupon/:id',auth.isLogin, adminController.editedcoupon)
admin_route.post('/addCoupons', auth.isLogin, adminController.couponadd)

admin_route.post('/orders', auth.isLogin, adminController.changeStatus)

admin_route.post('/banners/addBanners',auth.isLogin, upload.single("image"),adminController.insertbanner)

admin_route.post('/salesReport',auth.isLogin,adminController.salesReport)


admin_route.use(function(req,res,next){
    res.render('404')
})
module.exports = admin_route
