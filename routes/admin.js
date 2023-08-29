const common = require('../model/common')
const { message } = require('../model/message')
const { ensureAuthorized } = require('../model/auth')
// const logger = require("../model/logger")(__filename)
// const { decryptData } = require('../model/decrypt')
// const { createAccountLimiter, } = require('../model/rateLimit')
// const { checkAccess } = require("../model/common")

module.exports = (app) => {
    try{

        const admin = require('../controllers/admin')()
      app.get("/user/getAllUsers", admin.getAllUsers )
    }
    catch(error){
        console.log(error.message)
    }
}