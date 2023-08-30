const { default: mongoose } = require("mongoose");
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
 //get all Groupa
    router.getAllGroups = async (req,res) => {
      let data = { status: 0, response: message.inValid }, groupData

      try {
        groupData = await db.findAndSelect("group", { status: { $in: [1] } }, { _id: 1, name: 1, managedBy: 1, users: 1, status: 1 })
        if (groupData) {
  
          return res.send({ status: 1, data: JSON.stringify(groupData) })
        }
      } catch (error) {
        // console.log(`Error in country controller - getCountryList: ${error.message}`)
        data.response = error.message
        res.send(data)
      }
  }

  //insert Group
  router.insertGroup = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let groupData = req.body,  insertGroup, updateManagerBy, users, updateUser

      if (Object.keys(groupData).length === 0 && groupData.data === undefined) {
        res.send(data)

        return
      }
      groupData = groupData.data[0]
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }
      groupData.systemInfo = req.rawHeaders
      
      insertGroup = await db.insertSingleDocument("group", groupData)
      // updateManagerBy = await db.updateOneDocument("user", { _id: new ObjectId(groupData.managedBy) }, {role: 3})
      // users = groupData.users
      
      // for(let i=0;  i<users.length; i++){
      //   updateManagerBy = await db.updateOneDocument("user", { _id: new ObjectId(users[i]) }, )

      // }



      if (insertGroup) {
        // event.eventEmitterInsert.emit(
        //   'insert',
        //   'countryClone',
        //   {
        //     "originalId": insertCountry._doc._id,
        //     "actionType": 'insert',
        //     "data": insertCountry._doc
        //   }
        // )

        return res.send({ status: 1, response: message.addedGroupSucess })
      }
    } catch (error) {
      // logger.error(`Error in group controller - insertGroup: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Update Group
  router.updateGroup = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let groupData = req.body,  updateGroup

      if (Object.keys(groupData).length === 0 && groupData.data === undefined) {
        res.send(data)

        return
      }
      groupData = groupData.data[0]
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }

      if (!mongoose.isValidObjectId(groupData.id)) {

        return res.send({ status: 0, response: message.invalidId })
      }
      groupData.systemInfo = req.rawHeaders      
      
      updateGroup = await db.updateOneDocument("group", { _id: new ObjectId(groupData.id) }, groupData)

      if (updateGroup) {
        // event.eventEmitterInsert.emit(
        //   'insert',
        //   'countryClone',
        //   {
        //     "originalId": insertCountry._doc._id,
        //     "actionType": 'insert',
        //     "data": insertCountry._doc
        //   }
        // )

        return res.send({ status: 1, response: message.updateGroupSucess })
      }
    } catch (error) {
      // logger.error(`Error in group controller - insertGroup: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
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