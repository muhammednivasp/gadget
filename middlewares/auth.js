const user = require("../model/userdata1")

const isLogin=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){

        }else{
           return res.redirect('/admin');
        }
        next()
    } catch (error) {
        res.render('error', { message: error.message })

        
    }
}


const isLogout=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){
        return    res.redirect("/admin/dashboard")
        }
        next();
    } catch (error) {
        res.render('error', { message: error.message })

        
    }
}

// user
const isuserLogin=async(req,res,next)=>{
    try {
     
        if(req.session.user){
            console.log(req.session.user)
          if(req.session.user.status===false){
            next()

          }else{
            req.session.user = null
           return res.redirect('/login');
          }
        }else{

           return res.redirect('/login');
           
        }
        
    } catch (error) {
        res.render('error', { message: error.message })

        
    }
}


const isuserLogout=async(req,res,next)=>{
    try {
        
        if(req.session.user){
        return    res.redirect('/')
        }else{

        }
        next();
    } catch (error) {
        res.render('error', { message: error.message })

        
    }
}


module.exports ={
    isLogin,
    isLogout,
    isuserLogin,
    isuserLogout,
    }