
const express = require("express")
const adminRoute = express()

//body parser
const bodyparser = require('body-parser')
adminRoute.use(bodyparser.json())
adminRoute.use(bodyparser.urlencoded({ extended: true }))



//admin controller
const adminController = require('../controllers/adminController')
// //category controller
// const categoryController=require('../controllers/adminController')
// //product controller
// const productController = require('../controllers/admincontroller')

const path = require('path')

const multer = require('multer')

//view engine
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', 'views/admin')

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
adminRoute.get('/', auth.isLogout, adminController.adminLogin)

adminRoute.get('/logout', auth.isLogin, adminController.adminLogout)

adminRoute.get('/category', auth.isLogin, adminController.Category)
adminRoute.get('/category/addcategory', auth.isLogin, adminController.add_category)
adminRoute.get('/category/unlistcat/:id', auth.isLogin, adminController.listCategory)
// adminRoute.get('/category/delete/:id', auth.isLogin, adminController.deletecat)
adminRoute.get('/category/editcategory/:id', auth.isLogin, adminController.vieweditcat)

adminRoute.get('/products', auth.isLogin, adminController.productShow)
adminRoute.get('/addproducts', auth.isLogin, adminController.addprodview)
// adminRoute.get('/products/productdelete/:id', auth.isLogin, adminController.deleteproduct)
adminRoute.get('/products/productedit/:id', auth.isLogin, adminController.vieweditproduct)
adminRoute.get('/products/unlist/:id', auth.isLogin, adminController.listProduct)

// adminRoute.get('/products/productedit/:id',upload.array("image",3),adminController.editproduct_page)
adminRoute.get('/deleteimg/:imgid/:prodid',adminController.deleteimage)

adminRoute.get('/userview', auth.isLogin, adminController.usersView)
adminRoute.get('/userview/block/:id', auth.isLogin, adminController.userBlock)
adminRoute.get('/userview/unblock/:id', auth.isLogin, adminController.unBlockuser)

adminRoute.get('/coupon', auth.isLogin, adminController.couponview)
adminRoute.get('/addCoupons', auth.isLogin, adminController.addcoupons)
adminRoute.get('/coupon/editcoupon/:id', auth.isLogin, adminController.couponedit)
adminRoute.get('/coupon/delete/:id', auth.isLogin, adminController.deletecoupon)

adminRoute.get('/banners', auth.isLogin, adminController.bannershow)
adminRoute.get('/banners/addbanners',auth.isLogin,adminController.addbanner)
adminRoute.get('/banners/deletebanner/:id',auth.isLogin,adminController.deletebanner)

adminRoute.get('/orders', auth.isLogin, adminController.orders)

adminRoute.get('/dashboard',auth.isLogin,adminController.dashboard)
adminRoute.get('/salesReport',auth.isLogin,adminController.sales)


//post
adminRoute.post('/', adminController.loginVerify)

adminRoute.post('/category/addcategory',auth.isLogin, adminController.newcategory)
adminRoute.post('/category/editcategory/:id',auth.isLogin, adminController.EditCategory)

adminRoute.post('/addproducts', upload.array("image"), adminController.addproduct)
adminRoute.post('/products/productedit/:id', upload.array("image"), adminController.editproduct)

adminRoute.post('/editimage/:id', upload.array("image"), adminController.editimg)

adminRoute.post('/coupon/editcoupon/:id',auth.isLogin, adminController.editedcoupon)
adminRoute.post('/addCoupons', auth.isLogin, adminController.couponadd)

adminRoute.post('/orders', auth.isLogin, adminController.changeStatus)

adminRoute.post('/banners/addBanners',auth.isLogin, upload.single("image"),adminController.insertbanner)

adminRoute.post('/salesReport',auth.isLogin,adminController.salesReport)


adminRoute.use(function(req,res,next){
    res.render('404')
})
module.exports = adminRoute
