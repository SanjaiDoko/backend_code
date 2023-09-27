const { default: mongoose } = require("mongoose");
const { message } = require("../model/message");
const db = require("../model/mongodb");
const { ObjectId } = require("bson");
const bcrypt = require("bcrypt");

module.exports = () => {
  let router = {};

  router.adminRegistration = async (req, res) => {
    let data = { status: 0, response: "Invalid request" },
      adminData = req.body,
      checkEmail,
      insertUser;

    try {
      if (Object.keys(adminData).length === 0 && adminData.data === undefined) {
        res.send(data);

        return;
      }
      adminData = adminData.data[0];
      adminData.systemInfo = req.rawHeaders;
      adminData.password = bcrypt.hashSync(adminData.password, 10);
      checkEmail = await db.findOneDocumentExists("internal", {
        email: adminData.email,
      });
      if (checkEmail === true) {
        return res.send({ status: 0, response: "Email already exists" });
      }
      insertUser = await db.insertSingleDocument("internal", adminData);
      return res.send({
        status: 1,
        data: insertUser._id,
        response: "Registration successfully completed",
      });
    } catch (error) {
      return res.send(error.message);
    }
  };

  router.getAllUsers = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      usersData;

    try {
      usersData = await db.findAndSelect(
        "user",
        { status: { $in: [1, 2] } },
        {
          _id: 1,
          fullName: 1,
          mobileNumber: 1,
          email: 1,
          createdAt: 1,
          status: 1,
          groupId: 1,
        }
      );
      if (usersData) {
        return res.send({ status: 1, data: JSON.stringify(usersData) });
      }
    } catch (error) {
      console.log(
        `Error in country controller - getCountryList: ${error.message}`
      );
      data.response = error.message;
      res.send(data);
    }
  };

  //get User By Id
  router.getUserById = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      userId,
      userData;

    try {
      userId = req.body;
      if (Object.keys(userId).length === 0 && userId.data === undefined) {
        res.send(data);

        return;
      }
      userId = userId.data[0];
      if (!mongoose.isValidObjectId(userId.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }
      userData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(userId.id) },
        { _id: 1, fullName: 1 }
      );
      if (userData !== null && Object.keys(userData).length !== 0) {
        return res.send({ status: 1, data: userData });
      }

      return res.send(data);
    } catch (error) {
      // logger.error(`Error in user controller - getUserEmailbyId: ${error.message}`)
      res.send(error.message);
    }
  };

  //get all Groupa
  router.getAllGroups = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      groupData;
    groupDataArray = [];

    try {
      groupData = await db.findAndSelect(
        "group",
        { status: { $in: [1, 2] } },
        { _id: 1, name: 1, managedBy: 1, users: 1, status: 1 }
      );

      const countTicket = (data, status) => {
        return data.filter((doc) => doc.status === status).length;
      };

      for (let i = 0; i < groupData.length; i++) {
        let singleGroupData = {};
        singleGroupData.groupId = `${groupData[i]._doc._id}`;
        singleGroupData.name = `${groupData[i]._doc.name}`;
        singleGroupData.status = `${groupData[i]._doc.status}`;

        let data = await db.findDocuments(
          "user",
          { groupId: new ObjectId(groupData[i]._doc._id) },
          { _id: 1, fullName: 1, role: 1 }
        );

        //ticket Data
        let ticketData = await db.findDocuments(
          "ticket",
          { issueGroup: new ObjectId(groupData[i]._doc._id) },
          { status: 1 }
        );

        singleGroupData.openTicket = countTicket(ticketData, 0);
        singleGroupData.inProgressTicket = countTicket(ticketData, 2);
        singleGroupData.completedTicket = countTicket(ticketData, 1);
        singleGroupData.rejectedTicket = countTicket(ticketData, 3);
        singleGroupData.totalTicket = ticketData.length;
        // Filter documents with role 3 = managedBy
        const managedBy = data.filter((doc) => doc.role === 3);
        singleGroupData.managedBy = {
          name: managedBy[0]?.fullName,
          managedBy: managedBy[0]?._id,
        };

        // Filter documents with role 1
        const users = data.filter((doc) => doc.role === 1);
        singleGroupData.users = users;
        groupDataArray = [...groupDataArray, singleGroupData];
      }

      if (groupDataArray) {
        return res.send({ status: 1, data: JSON.stringify(groupDataArray) });
      }
    } catch (error) {
      // console.log(`Error in country controller - getCountryList: ${error.message}`)
      data.response = error.message;
      res.send(data);
    }
  };

  //insert Group
  router.insertGroup = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let groupData = req.body,
        insertGroup,
        updateManagerBy,
        users,
        updateUser;

      if (Object.keys(groupData).length === 0 && groupData.data === undefined) {
        res.send(data);

        return;
      }

      groupData = groupData.data[0];
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }
      groupData.systemInfo = req.rawHeaders;

      users = groupData.users;
      insertGroup = await db.insertSingleDocument("group", groupData);
      updateManagerBy = await db.updateOneDocument(
        "user",
        { _id: new ObjectId(groupData.managedBy) },
        { role: 3 }
      );

      updateUser = await db.updateOneDocument(
        "user",
        { _id: new ObjectId(groupData.managedBy) },
        { groupId: insertGroup._doc._id }
      );

      for (let i = 0; i < users.length; i++) {
        await db.updateOneDocument(
          "user",
          { _id: new ObjectId(users[i]) },
          { groupId: insertGroup._doc._id }
        );
      }

      if (insertGroup && updateManagerBy) {
        // event.eventEmitterInsert.emit(
        //   'insert',
        //   'countryClone',
        //   {
        //     "originalId": insertCountry._doc._id,
        //     "actionType": 'insert',
        //     "data": insertCountry._doc
        //   }
        // )

        return res.send({ status: 1, response: message.addedGroupSucess });
      }
    } catch (error) {
      // logger.error(`Error in group controller - insertGroup: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found";
      } else {
        data.response = error.message;
      }
      res.send(data);
    }
  };

  //Update Group
  router.updateGroup = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      users,
      updateUser,
      updateGroup;

    try {
      let groupData = req.body;

      if (Object.keys(groupData).length === 0 && groupData.data === undefined) {
        res.send(data);

        return;
      }
      groupData = groupData.data[0];

      users = groupData.users;
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }

      if (!mongoose.isValidObjectId(groupData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }
      groupData.systemInfo = req.rawHeaders;

      updateGroup = await db.updateOneDocument(
        "group",
        { _id: new ObjectId(groupData.id) },
        groupData
      );

      for (let i = 0; i < users.length; i++) {
        await db.updateOneDocument(
          "user",
          { _id: new ObjectId(users[i]) },
          { groupId: groupData.id },

        );
      }

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

        return res.send({ status: 1, response: message.updateGroupSucess });
      }
    } catch (error) {
      // logger.error(`Error in group controller - insertGroup: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found";
      } else {
        data.response = error.message;
      }
      res.send(data);
    }
  };

  //Remove User From Group
  router.removeUserFromGroup = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let userData = req.body,
        updateUser;

      if (Object.keys(userData).length === 0 && userData.data === undefined) {
        res.send(data);

        return;
      }
      userData = userData.data[0];
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }

      if (!mongoose.isValidObjectId(userData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }
      userData.systemInfo = req.rawHeaders;

      updateUser = await db.updateOneDocument(
        "user",
        { _id: new ObjectId(userData.id) },
        { groupId: null }
      );

      if (updateUser) {
        // event.eventEmitterInsert.emit(
        //   'insert',
        //   'countryClone',
        //   {
        //     "originalId": insertCountry._doc._id,
        //     "actionType": 'insert',
        //     "data": insertCountry._doc
        //   }
        // )

        return res.send({ status: 1, response: message.removeUserGroupSucess });
      }
    } catch (error) {
      // logger.error(`Error in group controller - insertGroup: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found";
      } else {
        data.response = error.message;
      }
      res.send(data);
    }
  };

  // Get Users By GroupId
  router.getUsersByGroupId = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      groupId,
      userData;

    try {
      groupId = req.body;
      if (Object.keys(groupId).length === 0 && groupId.data === undefined) {
        res.send(data);

        return;
      }
      groupId = groupId.data[0];
      if (!mongoose.isValidObjectId(groupId.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }

      userData = await db.findDocuments(
        "user",
        { groupId: new ObjectId(groupId) },
        { _id: 1, fullName: 1, role: 1, groupId: 1 }
      );

      // if (groupData) {
      //   return res.send({ status: 1, data: JSON.stringify(groupData) });
      // }

      if (userData.length !== 0) {
        return res.send({ status: 1, data: JSON.stringify(userData) });
      }

      return res.send({ status: 1, data: "[]" });
    } catch (error) {
      // logger.error(`Error in bokingmanagement controller - getBookingsbyScheduleId: ${error.message}`)
      res.send(error.message);
    }
  };

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

  // roomBookingController
  router.createRoom = async (req, res) => {
    try {
      let createRoom = req.body, checkExist;

      createRoom = createRoom.data[0]
      checkExist = await db.findSingleDocument("room",{ roomNo: createRoom.roomNo });
      if (checkExist) {
        return res.send({
          status: 0,
          response: "Room with same number already exist",
        });
      }
      await db.insertSingleDocument("room", createRoom)
      return res.send({ status: 1, response: "Room created" });
    } catch (error) {
      return res.send({ status: 0, response: error });
    }
  };

  
  router.updateRoom = async (req, res) => {
    try {
      let updateRoom = req.body,
        getRoom;
        updateRoom = updateRoom.data[0]
      getRoom = await db.findSingleDocument("room",{ _id: updateRoom.id});
      if (!getRoom) {
        return res.send({ status: 1, data: JSON.stringify(getRoom)  });
      } else {
     await db.updateOneDocument(
          "room",
          { _id: new ObjectId(updateRoom.id) },
         updateRoom
        );
        return res.send({ status: 1, response: "Room updated" });
      }
    } catch (error) {
      return res.send({ status: 0, response: error });
    }
  };


  router.deleteRoom = async (req, res) => {
    try {
      let deActivateRoom = req.body,
        getRoom;
        deActivateRoom = deActivateRoom.data[0]
      getRoom = await db.findSingleDocument("room",{ _id: deActivateRoom.id });
      if (!getRoom) {
        return res.send({ status: 1, data: JSON.stringify(getRoom)  });
      } else {
        if (getRoom.activeStatus === 1) {
          await db.findByIdAndUpdate("room",deActivateRoom.id,{activeStatus: 2})
          return res.send({ status: 1, response: "Room updated" });
        }
        await db.findByIdAndUpdate("room",deActivateRoom.id,{activeStatus: 1})
        return res.send({ status: 1, response: "Room updated" });
      }
    } catch (error) {
      return res.send({ status: 0, response: error });
    }
  };


  return router;
};
