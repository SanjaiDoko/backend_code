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

    app.post("/admin/register", admin.adminRegistration, admin.adminRegistration)

    app.get("/user/getAllUsers", ensureAuthorized, admin.getAllUsers);
    app.get("/user/getUsersById", ensureAuthorized, admin.getUserById);
    app.post("/user/getUserByGroupId", ensureAuthorized, admin.getUsersByGroupId);

     //groups APIs
     app.get('/group/getAllGroups', ensureAuthorized,  admin.getAllGroups) //rdt,admin
     app.post('/group/insertGroup', ensureAuthorized, groupValidation.insertGroup, admin.insertGroup) //admin
     app.post('/group/updateGroup', ensureAuthorized,   groupValidation.updateGroup, admin.updateGroup) //admin
     app.post('/group/removeUserById', ensureAuthorized,  admin.removeUserFromGroup) //admin
    

    // app.post("/admin/register", admin.registration)

    //roomApi's
    app.post("/room/deleteRoom", admin.deleteRoom)
    app.post("/room/createRoom", admin.createRoom)
    app.post("/room/updateRoom", admin.updateRoom)
  } catch (error) {
    console.log(error.message);
  }
};
