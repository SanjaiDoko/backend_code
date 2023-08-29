//Imports
// const logger = require("../model/logger")(__filename)
// const { ensureAuthorized } = require('../model/auth')
// const { createAccountLimiter } = require('../model/rateLimit')
// const { decryptData } = require('../model/decrypt')
// const { checkAccess } = require("../model/common")

module.exports = (app) => {
    try {

        //User Validation
        const userValidation = require("../validation/user/userValidation")()

        //User Controllers
        const user = require("../controllers/user")()

        app.post("/user/register", userValidation.registerUser, user.registration)

        app.post("/user/login", userValidation.loginUser, user.login)

        app.post('/user/forgotpassword', userValidation.checkEmail, user.forgotPassword)

        app.post('/user/changeForgotPassword', userValidation.forgotPassword, user.changeForgotPassword)

        app.get("/crm",(req,res) => {

            return res.send("welcome to the crm")
        })

    } catch (e) {
        console.log(`Error in user route: ${e}`)
    }};