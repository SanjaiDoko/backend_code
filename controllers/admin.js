const common = require("../model/common")
const message = require("../model/message")
const db = require('../model/mongodb');

module.exports = () => {
    let router = {}

    router.getAllUsers = async (req,res) => {
        let data = { status: 0, response: message.inValid }, usersData

        try {
          usersData = await db.findAndSelect("user", { status: { $in: [1, 2] } }, { _id: 1, fullName: 1, mobileNumber: 1, email: 1, createdAt: 1 })
          if (usersData) {
    
            return res.send({ status: 1, data: JSON.stringify(usersData) })
          }
        } catch (error) {
          console.log(`Error in country controller - getCountryList: ${error.message}`)
          data.response = error.message
          res.send(data)
        }
    }

    return router
}