const express = require('express')
const mongoose = require('mongoose')

//database
require('dotenv').config()
const mongo = process.env.mongo
mongoose.connect(mongo)

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
app.use(express.static(path.join(__dirname,'public')))


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

const adminroute = require('./routes/admin_route')
app.use('/admin', adminroute)

const userroute = require('./routes/user_route')
app.use('/', userroute)

app.listen(3000, () => {
    console.log('server started')
})