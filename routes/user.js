//Imports
// const logger = require("../model/logger")(__filename)
// const { ensureAuthorized } = require('../model/auth')
// const { createAccountLimiter } = require('../model/rateLimit')
// const { decryptData } = require('../model/decrypt')
// const { checkAccess } = require("../model/common")

const { ensureAuthorized } = require("../model/auth");

module.exports = (app) => {
    try {

        //User Validation
        const userValidation = require("../validation/user/userValidation")()

        //User Controllers
        const user = require("../controllers/user")()

        app.post("/user/register", userValidation.registerUser, user.registration)

        app.post("/user/getUserDetails", ensureAuthorized, userValidation.checkId, user.getUserDetails )

        app.post("/user/login", userValidation.loginUser, user.login)

        app.post('/user/forgotpassword', userValidation.checkEmail, user.forgotPassword)

        app.post('/user/changeForgotPassword', userValidation.forgotPassword, user.changeForgotPassword)

        app.post('/user/logout', userValidation.checkId, user.logout)
        
        app.post('/user/feedBack', userValidation.checkFeedBack, user.sendFeedBack)

        app.post('/user/updateStatus', ensureAuthorized,  user.updatedUserStatusById) 
        
        //chat
        // app.post('/user/getChats', userValidation.checkChat,  user.getAllChats) 


        // Eod

        app.post('/eod/insertEod', userValidation.insertEod, user.insertEod)

        app.post('/eod/getEodsByUserId', userValidation.checkId, user.getEodsByUserId)

        app.post('/eod/getEodsByMangerId', user.getEodsByManagerId)

        app.post('/eod/getEodDetailsById', userValidation.checkId, user.getEodDetailsById)

        app.get("/crm",(req,res) => {

            return res.send("welcome to the crm")
        })

    } catch (e) {
        console.log(`Error in user route: ${e}`)
    }};