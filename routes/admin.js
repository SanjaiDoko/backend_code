const common = require("../model/common");
const { message } = require("../model/message");
const { ensureAuthorized } = require("../model/auth");
// const logger = require("../model/logger")(__filename)
// const { decryptData } = require('../model/decrypt')
// const { createAccountLimiter, } = require('../model/rateLimit')
// const { checkAccess } = require("../model/common")

module.exports = (app) => {
  try {

    const admin = require("../controllers/admin")();
    const groupValidation = require("../validation/admin/groupValidation")()

    app.get("/user/getAllUsers", admin.getAllUsers);

    app.get("/user/getUsersById", admin.getAllUsers);

    //groups APIs
    app.get('/group/getAllGroups', admin.getAllGroups) //rdt,admin
    app.post('/group/insertGroup', groupValidation.insertGroup, admin.insertGroup) //admin
    app.post('/group/updateGroup', groupValidation.updateGroup, admin.updateGroup) //admin


    // app.post("/admin/register", admin.registration)

    //roomApi's
    app.post("/deleteRoom", admin.deleteRoom)
    app.post("/createRoom", admin.createRoom)
    app.post("/updateRoom", admin.updateRoom)
  } catch (error) {
    console.log(error.message);
  }
};
