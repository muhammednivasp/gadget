//login schema
const admin = require('../model/adminData')

//category schema
const addcategory = require('../model/addcategory')

//product schema
const productDatas = require('../model/product')

// user schema
const usersSetup = require('../model/userData')

//banner
const banner = require('../model/bannermodel')

//coupen
const couponDatas = require('../model/coupon')

//banner
const bannerDatas = require('../model/bannermodel')

//orders
const orderDatas = require('../model/orderDatas')

//moment
const moment = require('moment')

//fs module
const fs = require('fs')

//path
const path = require('path')
const { log } = require('console')



let session

//login page
const adminLogin = async (req, res, next) => {
    try {
        res.render('adminlogin')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}


//login verify
const loginVerify = async (req, res, next) => {
    try {
        const {
            username,
            password
        } = req.body

        const adminData = await admin.findOne({ username: username })
        if (adminData) {
            if (password === adminData.password) {
                req.session.admin_id = adminData._id
                res.redirect('/admin/dashboard')
            }
            else {
                res.render('adminlogin', { message: " Password is incorrect" })
            }
        }
        else if (username == "" && password == "") {
            res.render('adminlogin', { message: "User and passwoard required" })

        }
        else {
            res.render('adminlogin', { message: "Enter a valid username" })
        }
    }
    catch (error) {
        res.render('error', { message: error.message })
    }
}


//logout
const adminLogout = async (req, res, next) => {
    try {
        req.session.admin_id = null;
        res.redirect('/admin')

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//========================================================================================================================================================

//category controller
const Category = async (req, res, next) => {
    try {

        const category_data = await addcategory.find({})

        res.render('category', { categoryDatas: category_data })

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//add cat view
const add_category = async (req, res, next) => {
    try {
        res.render('addcategory')
    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//add category
const newcategory = async (req, res, next) => {
    try {
        let uppcategory = req.body.category
        const des = req.body.description
        uppcategory = uppcategory.trim()
        const upper = uppcategory.toUpperCase()


        if (uppcategory.length === 0) {
            res.render('addcategory', { message: "values required in fields" })
        } else {


            let result = await addcategory.findOne({ category: upper })
            if (result) {
                res.render('addcategory', { message: "already exists" })
                result = null
            }
            else {

                const category = new addcategory({
                    category: upper,
                    description: req.body.description
                })
                const pluscategory = await category.save()
                if (pluscategory) {
                    res.render('addcategory', { message: "success" })
                }
                else {
                    res.render('addcategory', { message: "error" })
                }
            }
        }

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//view edit category
const vieweditcat = async (req, res, next) => {
    try {
        let id = req.params.id
        const categData = await addcategory.findById({ _id: id })
        if (categData) {
            res.render('editcategory', { viewcat: categData })
        }
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//edit category
const EditCategory = async (req, res, next) => {
    try {
        let newCateg = req.body.newcategory
        newCateg = newCateg.trim();
        let newDesc = req.body.newdescription

        let uppercateg = newCateg.toUpperCase()
        let id = req.params.id
        const catData = await addcategory.findById({ _id: id })
        const newcat = await addcategory.findOne({ category: uppercateg })
        if (newcat && newcat._id != id) {
            res.render('editcategory', { message: "Already exist", viewcat: catData })
        } else if (newCateg.length === 0) {
            res.render('editcategory', { message: "category name can't be only spaces", viewcat: catData })
        } else {
            if (catData.category == uppercateg) {
                if (catData.description == newDesc) {
                    res.render('editcategory', { message: "no change", viewcat: catData })
                } else
                    await addcategory.updateOne({ _id: id }, { $set: { description: newDesc } })
                res.redirect('/admin/category')
            } else {
                await addcategory.updateOne({ _id: id }, { $set: { category: uppercateg, description: newDesc } })
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        res.render('error', { message: error.message })
    }
}


//LIST CATEGORY
const listCategory = async (req, res, next) => {
    try {
        const id = req.params.id
        const collection = await addcategory.findOne({ _id: id })
        if (collection.unlist == true) {
            let unlist = await addcategory.updateOne({ _id: id }, { $set: { unlist: false } })
            res.redirect(req.headers.referer || "/");
        } else {
            let unlist = await addcategory.updateOne({ _id: id }, { $set: { unlist: true } })
            res.redirect(req.headers.referer || "/");
        }

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//=========================================================================================================================================================

//product controller
const productShow = async (req, res, next) => {
    try {
        const productdatas = await productDatas.find({}).populate('category')
        res.render('products', { prodDatas: productdatas })

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//add product view
const addprodview = async (req, res, next) => {
    try {
        const productdatas = await addcategory.find({})

        res.render('addproducts', { prodcategory: productdatas })

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//add product
const addproduct = async (req, res, next) => {
    try {

        const arrayimg = []
        for (var i = 0; i < req.files.length; i++) {
            arrayimg[i] = req.files[i].filename
        }
        const product = new productDatas({
            productname: req.body.productname.toUpperCase(),
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            image: arrayimg

        })
        await product.save()
        res.redirect('/admin/products')

    } catch (error) {
        res.render('error', { message: error.message })
    }
}


// view edit products
const vieweditproduct = async (req, res, next) => {
    try {
        let id = req.params.id
        const productdata = await productDatas.findById({ _id: id }).populate('category').exec()
        const product_datas = await addcategory.find({})

        if (productdata) {
            res.render('editproduct', { viewprod: productdata, prodcategory: product_datas })
        }
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

// edit products
const editproduct = async (req, res, next) => {
    try {

        const id = req.params.id

        await productDatas.updateOne({ _id: id }, {
            $set: {
                productname: req.body.newproductname.toUpperCase(),
                category: req.body.category,
                description: req.body.newdescription,
                stock: req.body.newstock,
                price: req.body.newprice,


            }
        })

        res.redirect('/admin/products')

    } catch (error) {
        res.render('error', { message: error.message })
    }
}


//edit image(
const editimg = async (req, res, next) => {
    try {
        const arrayimg = []

        for (file of req.files) {
            arrayimg.push(file.filename)
        }
        const id = req.params.id
        const editimage = await productDatas.updateOne({ _id: id }, { $push: { image: { $each: arrayimg } } })
        res.redirect('/admin/products/productedit/' + id)

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//delete img
const deleteimage = async (req, res, next) => {
    try {
        const imgid = req.params.imgid
        const prodid = req.params.prodid
        fs.unlink(path.join(__dirname, "../public/images/", imgid), () => { })
        const productimg = await productDatas.updateOne({ _id: prodid }, { $pull: { image: imgid } })
        res.redirect('/admin/products/productedit/' + prodid)

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//unlist and list
const listProduct = async (req, res, next) => {
    try {
        const id = req.params.id
        const collection = await productDatas.findOne({ _id: id })
        if (collection.unlist == true) {
            let unlist = await productDatas.updateOne({ _id: id }, { $set: { unlist: false } })
            res.redirect('/admin/products')
        } else {
            let unlist = await productDatas.updateOne({ _id: id }, { $set: { unlist: true } })
            res.redirect('/admin/products')
        }

    } catch (error) {
        res.render('error', { message: error.message })
    }
}
//===========================================================================================================================================================
//usersview
const usersView = async (req, res, next) => {
    try {
        const userSetup = await usersSetup.find({})

        res.render('userview', { userview: userSetup })

    } catch (error) {
        res.render('error', { message: error.message })

    }
}

//user block
const userBlock = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) {
            throw new error('User id is missing')
        }
        const status = await usersSetup.updateOne({ _id: id }, { $set: { status: true } })
        req.session.user = null
        res.redirect('/admin/userview')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//user unblock
const unBlockuser = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) {
            throw new error('User id is missing')
        }
        const status = await usersSetup.updateOne({ _id: id }, { $set: { status: false } })
        res.redirect('/admin/userview')
    } catch (error) {
        res.render('error', { message: error.message })
    }

}

//coupen
const couponview = async (req, res, next) => {
    try {
        const coupondata = await couponDatas.find({})
        res.render("coupon", { couponData: coupondata, moment: moment })
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//add coupen view
const addcoupons = async (req, res) => {
    try {
        res.render("addcoupons")
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//add coupen
const couponadd = async (req, res, next) => {
    try {
        const {
            code,
            expireDate,
            maxDiscount,
            minimumPurchase,
            off
        } = req.body
        let Code = code.trim().toUpperCase()
        if (Code.length === 0) {
            res.render('addcoupons', { message: "values required in fields" })
        } else {
            const codein = await couponDatas.findOne({ code: Code })
            if (codein) {
                res.render('addcoupons', { message: "Coupon code already exists" })
            } else {
                const coupon = new couponDatas({

                    code: Code, expirationDate: expireDate, maxDiscount: maxDiscount, MinPurchaceAmount: minimumPurchase, percentageOff: off

                })
                const saving = await coupon.save()
                res.redirect('/admin/coupon')
            }
        }

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//edit coupon view
const couponedit = async (req, res, next) => {
    try {
        id = req.params.id
        const edit = await couponDatas.findOne({ _id: id })
        if (edit) {
            res.render('editcoupon', { couponData: edit, moment: moment })
        }

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//edit update
const editedcoupon = async (req, res, next) => {
    try {
        const {
            newcode,
            newexpireDate,
            newmaxDiscount,
            newminimumPurchase,
            newoff
        } = req.body
        const id = req.params.id
        let Code = newcode.trim().toUpperCase()


        if (Code.length === 0) {
            res.render('addcoupons', { message: "values required in fields" })
        } else {
            const codein = await couponDatas.findOne({ code: Code })
            if (codein && codein._id != id) {
                res.render('addcoupons', { message: "Coupon code already exists" })
            } else {
                await couponDatas.updateOne({ _id: id }, { $set: { code: Code, expirationDate: newexpireDate, maxDiscount: newmaxDiscount, MinPurchaceAmount: newminimumPurchase, percentageOff: newoff } })
                res.redirect('/admin/coupon')
            }

        }
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//delete coupon
const deletecoupon = async (req, res, next) => {
    try {
        id = req.params.id
        await couponDatas.deleteOne({ _id: id })
        res.redirect('/admin/coupon')

    } catch (error) {
        res.render('error', { message: error.message })
    }
}


//orders
const orders = async (req, res, next) => {
    try {
        const ord = await orderDatas.find({}).populate('userId').populate('product.productId')
        const orders = ord.reverse()
        // console.log(ord);
        res.render('orderlisted', { order: orders })
    } catch (error) {
        res.render('error', { message: error.message })
    }
}



const changeStatus = async (req, res, next) => {
    try {

        const {
            orderId,
            status
        } = req.body
        const found = await orderDatas.updateOne({ orderId: orderId }, { $set: { status: status } })
        const datas = await orderDatas.findOne({ orderId: orderId })
        if (datas.status === "Returned") {
            const order = await orderDatas.findOne({ orderId: orderId }).populate('product.productId').populate('userId')
            if (order.paymentType == "UPI" || order.paymentType == "WALLET") {
                await usersSetup.updateOne({ _id: req.session.user._id }, { $inc: { wallet: order.total } })
            }
            for (let i = 0; i < order.product.length; i++) {
                const quantity = order.product[i].quantity
                await productDatas.updateOne({ _id: order.product[i].productId }, { $inc: { stock: quantity } })
            }
        }

        res.redirect('/admin/orders')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

// banner
const bannershow = async (req, res, next) => {
    try {
        const banner = await bannerDatas.find({})
        res.render("banners", { bannerData: banner })

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//addbanner
const addbanner = async (req, res, next) => {
    try {
        res.render('addbanner')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}


//insertbanner
const insertbanner = async (req, res, next) => {
    try {
        const description = req.body.description
        const bannerimage = req.file.filename
        const banner = new bannerDatas({
            description: description,
            image: bannerimage
        })
        const bannerData = await banner.save()
        res.redirect('/admin/banners')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//delete banner
const deletebanner = async (req, res, next) => {
    try {
        id = req.params.id
        await bannerDatas.deleteOne({ _id: id })
        res.redirect('/admin/banners')

    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//===========================================================================================================================================================

//dashbord
const dashboard = async (req, res, next) => {
    try {
        // let revenue = 0
        const usercount = await usersSetup.find({}).count()
        totrevenue = await orderDatas.aggregate([
            {
                $match: {
                    status: {
                        $eq: "Delivered"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            }
        ])
        const revenue = totrevenue.map((item) => {
            return item.totalAmount;
        })
        const revenueOfTheWeek = await orderDatas.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }, status: {
                        $eq: "Delivered"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            }
        ])
        const weekly = revenueOfTheWeek.map((item) => {
            return item.totalAmount;
        })
        const countweekly = revenueOfTheWeek.map((item) => {
            return item.count;
        });


        const date = new Date();
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const tdy = await orderDatas.aggregate([
            {
                $match: {
                    date: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    },
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const today = tdy.map((item) => {
            return item.totalAmount;
        });
        const counttoday = tdy.map((item) => {
            return item.count;
        });

        // console.log(today);

        const revenueyear = await orderDatas.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 365))
                    }, status: {
                        $eq: "Delivered"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            }
        ])
        const yearRevenue = revenueyear.map((item) => {
            return item.totalAmount;
        })
        const countyear = revenueyear.map((item) => {
            return item.count;
        });

        const sales = await orderDatas.find({ status: "Delivered" }).count()


        const cancelledOrdersCount = await orderDatas.aggregate([
            {
                $match: { status: "cancelled" }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ])
        const cancelledOrders = cancelledOrdersCount.map((item) => {
            return item.count;
        })

        const cod = await orderDatas.find({ status: "Delivered", paymentType: "COD" }).count()
        const online = await orderDatas.find({ status: "Delivered", paymentType: "UPI" }).count()
        const wallet = await orderDatas.find({ status: "Delivered", paymentType: "WALLET" }).count()
        const Cancelled = await orderDatas.find({ status: "Cancelled" }).count()
        const Delivered = await orderDatas.find({ status: "Delivered" }).count()
        const Shipped = await orderDatas.find({ status: "Shipped" }).count()
        const Confirmed = await orderDatas.find({ status: "Confirmed" }).count()
        const Pending = await orderDatas.find({ status: "Pending" }).count()
        const Returned = await orderDatas.find({ status: "Returned" }).count()

        const recentorder = await orderDatas.find({}).populate('product.productId').populate('userId').sort({ date: -1 })


        res.render('dashboard', {
            usercount: usercount, revenue, weekly, today, yearRevenue, sales, counttoday,
            countweekly, countyear, cod, online, wallet, Cancelled, Delivered, Shipped, Confirmed, Pending, Returned, recentorder
        })


    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//====================================================================================================================================================

//get sales
const sales = async (req, res, next) => {
    try {
        res.render('getReport')
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

//sales report
const salesReport = async (req, res, next) => {
    try {
        const existingDate = new Date(req.body.end);
        const newDate = new Date(existingDate);
        newDate.setDate(existingDate.getDate() + 1);

        if (req.body.from == "" || req.body.end == "") {
            res.render('salesreport', { message: 'All Fields Are Required' })
        } else {
            const sales = await orderDatas.find({
                status: "Delivered", date: {
                    $gte: new Date(req.body.from),
                    $lte: new Date(newDate)
                }
            }).populate('product.productId').populate('userId')
            const len = sales.length
            res.render('salesreport', { sales: sales, len });
        }
    } catch (error) {
        res.render('error', { message: error.message })
    }
}

module.exports = {
    //login
    adminLogin,
    loginVerify,
    adminLogout,

    //category
    Category,
    add_category,
    newcategory,
    vieweditcat,
    EditCategory,
    listCategory,

    //product
    productShow,
    addproduct,
    addprodview,
    vieweditproduct,
    editproduct,
    editimg,
    deleteimage,
    listProduct,

    //user
    usersView,
    userBlock,
    unBlockuser,

    couponview,
    addcoupons,
    couponadd,
    couponedit,
    editedcoupon,
    deletecoupon,

    orders,
    changeStatus,

    //banner
    bannershow,
    addbanner,
    insertbanner,
    deletebanner,

    dashboard,
    sales,
    salesReport
}