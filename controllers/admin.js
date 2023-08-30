const common = require("../model/common")
const { message } = require("../model/message")
const db = require('../model/mongodb');

module.exports = () => {
    let router = {}

    router.getAllUsers = async (req,res) => {
        let data = { status: 0, response: message.inValid }, usersData

        try {
          usersData = await db.findAndSelect("user", { status: { $in: [1, 2] } }, { _id: 1, fullName: 1, mobileNumber: 1, email: 1, createdAt: 1, status:1 })
          if (usersData) {
    
            return res.send({ status: 1, data: JSON.stringify(usersData) })
          }
        } catch (error) {
          console.log(`Error in country controller - getCountryList: ${error.message}`)
          data.response = error.message
          res.send(data)
        }
    }

    router.registration = async (req, res) => {
      let data = { status: 0, response: "Invalid request" },
        userData = req.body,
        checkEmail,
        insertUser;
  
      try {
        if (Object.keys(userData).length === 0 && userData.data === undefined) {
          res.send(data);
  
          return;
        }
        userData = userData.data[0];
        userData.systemInfo = req.rawHeaders;
        userData.password = bcrypt.hashSync(userData.password, 10);
        checkEmail = await db.findOneDocumentExists("internal", {
          email: userData.email,
        });
        if (checkEmail === true) {
          return res.send({ status: 0, response: "Email already exists" });
        }
        insertUser = await db.insertSingleDocument("internal", userData);
        return res.send({
          status: 1,
          data: insertUser._id,
          response: "Registration successfully completed",
        });
      } catch (error) {
        return res.send(error.message);
      }
    };

    return router
}