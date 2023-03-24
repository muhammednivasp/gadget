const mongoose = require('mongoose')
// mongoose.connect('mongodb://127.0.0.1:27017/gadgetstore')

//database
require('dotenv').config()
const mongo = process.env.mongo
mongoose.connect(mongo)

const express = require('express')
const app = express()

const session = require('express-session');

// xss preventer
// const helmet = require('helmet');
// app.use(helmet());

// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         scriptSrc: ["'self'"]
//       }
//     })
//   );

//   app.use(helmet.xssFilter());

  //==========================================================

//path
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))


//CACHE CONTROL
app.use((req, res, next) => {
    res.set("Cache-Control", "private,no-cache,no-store,must-revalidate");
    next();
})

//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
}
))

const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

app.listen(3000, () => {
    console.log('server started')
})