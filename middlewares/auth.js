const user = require("../model/userData")

const isLogin=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){

        }else{
           return res.redirect('/admin');
        }
        next()
    } catch (error) {
        console.log(error.message)
        
    }
}


const isLogout=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){
        return    res.redirect("/admin/dashboard")
        }
        next();
    } catch (error) {
        console.log(error.message)
        
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
        console.log(error.message)
        
    }
}


const isuserLogout=async(req,res,next)=>{
    try {
        
        if(req.session.user){
            // req.session.user = null
        return    res.redirect('/')
        }else{

        }
        next();
    } catch (error) {
        console.log(error.message)
        
    }
}


module.exports ={
    isLogin,
    isLogout,
    isuserLogin,
    isuserLogout,
    }