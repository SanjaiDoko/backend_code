var db = require("../model/mongodb");
const common = require("../model/common");
const bcrypt = require("bcrypt");
const { transporter } = require("../model/mail");
const ejs = require("ejs");
const path = require("path");
const { message } = require("../model/message");
const { ObjectId } = require("bson");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");

// const db = require('../model/mongodb')

module.exports = () => {
  let router = {},
    mailResendAttempts = 2;
  let templatePathUser = path.resolve("./templates/user/");

  const feedBackSendMail = async (mailData) => {
    console.log(mailData);
    ejs.renderFile(
      `${templatePathUser}/createTicket.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            subject: `CRM | Ticket assigned`,
            html: data,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                feedBackSendMail(mailData);
                mailResendAttempts--;
              } else {
                mailResendAttempts = 2;
              }
              console.log(`Create Ticket Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Create Ticket Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
  };

  const forgotPasswordMail = async (mailData) => {
    ejs.renderFile(
      `${templatePathUser}/forgotPassword.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        url: mailData.url,
        otp: mailData.otp,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            subject: `CRM | Attention! Password Reset Request`,
            html: data,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                forgotPasswordMail(mailData);
                mailResendAttempts--;
              } else {
                mailResendAttempts = 2;
              }
              console.log(`Forgot Password Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Forgot Password Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
  };

  const eodMail = async (mailData) => {
    ejs.renderFile(
      `${templatePathUser}/eodMail.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        userName: mailData.userName,
        url: mailData.url,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            cc: mailData.mail,
            subject: `CRM | EOD MAIL - ${mailData.userName.toUpperCase()}`,
            html: data,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                eodMail(mailData);
                mailResendAttempts--;
              } else {
                mailResendAttempts = 2;
              }
              console.log(`Eod Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Eod Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
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
      checkEmail = await db.findOneDocumentExists("user", {
        email: userData.email,
      });
      if (checkEmail === true) {
        return res.send({ status: 0, response: "Email already exists" });
      }
      insertUser = await db.insertSingleDocument("user", userData);
      return res.send({
        status: 1,
        data: insertUser._id,
        response: "Registration successfully completed",
      });
    } catch (error) {
      return res.send(error.message);
    }
  };

  //Get User Details
  router.getUserDetails = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let userData = req.body,
        userDetails;

      if (Object.keys(userData).length === 0 && userData.data === undefined) {
        return res.send(data);
      }
      userData = userData.data[0];
      if (!mongoose.isValidObjectId(userData.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }

      if (userData.type === 1) {
        userDetails = await db.findSingleDocument(
          "user",
          { _id: userData.id },
          { fullName: 1, _id: 1, mobileNumber: 1, email: 1, role: 1 }
        );
      } else if (userData.type === 2) {
        userDetails = await db.findSingleDocument(
          "internal",
          { _id: userData.id },
          { fullName: 1, _id: 1, mobileNumber: 1, email: 1, role: 1 }
        );
      } else {
        return res.send({ status: 0, response: "Type cannot be empty" });
      }

      if (userDetails) {
        return res.send({ status: 1, data: JSON.stringify(userDetails) });
      }

      return res.send(data);
    } catch (error) {
      console.log(
        `Error in user controller - updateuserstatusById: ${error.message}`
      );
      res.send(error.message);
    }
  };

  //Login
  router.login = async (req, res) => {
    let data = { status: 0, response: "Invalid Request" };

    try {
      let loginData = req.body;

      if (Object.keys(loginData).length === 0 && loginData.data === undefined) {
        res.send(data);

        return;
      }
      loginData = loginData.data[0];
      //   loginData.password = common.decryptAPI(loginData.password)

      if (loginData.type === 1) {
        //Type 1 - User Schema

        common.loginParameter("user", loginData, res, req);
      } else if (loginData.type === 2) {
        //Type 2 - Internal Schema
        common.loginParameter("internal", loginData, res, req);
      } else {
        return res.send(data);
      }
      // return res.send(data);
    } catch (error) {
      console.log(`Error in user controller - login: ${error.message}`);
      res.send(error.message);
    }
  };

  //Logout
  router.logout = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let logoutData = req.body;

      if (
        Object.keys(logoutData).length === 0 &&
        logoutData.data === undefined
      ) {
        res.send(data);

        return;
      }
      logoutData = logoutData.data[0];

      if (!mongoose.isValidObjectId(logoutData.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }

      if (logoutData.type === 1) {
        //Type 1 - User Schema
        common.logoutParameter("user", logoutData, res, req);
      } else if (logoutData.type === 2) {
        //Type 2 - Partner Schema
        common.logoutParameter("internal", logoutData, res, req);
      } else {
        return res.send(data);
      }
    } catch (error) {
      logger.error(`Error in user controller - logout: ${error.message}`);
      res.send(error.message);
    }
  };

  //update Status
  router.updatedUserStatusById = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let statusData = req.body,
        updateStatus;

      if (
        Object.keys(statusData).length === 0 &&
        statusData.data === undefined
      ) {
        return res.send(data);
      }
      statusData = statusData.data[0];
      if (!mongoose.isValidObjectId(statusData.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }

      updateStatus = await db.findByIdAndUpdate("user", statusData.id, {
        status: statusData.status,
      });

      if (updateStatus.modifiedCount !== 0 && updateStatus.matchedCount !== 0) {
        return res.send({ status: 1, response: "Updated Successfully" });
      }

      return res.send(data);
    } catch (error) {
      logger.error(
        `Error in user controller - updateuserstatusById: ${error.message}`
      );
      res.send(error.message);
    }
  };

  //Forgot Password
  router.forgotPassword = async (req, res) => {
    let data = { status: 0, response: "Invalid request" };

    try {
      let forgotPasswordData = req.body,
        userData,
        otp,
        otpAdd;

      if (
        Object.keys(forgotPasswordData).length === 0 &&
        forgotPasswordData.data === undefined
      ) {
        res.send(data);

        return;
      }
      forgotPasswordData = forgotPasswordData.data[0];

      otp = common.otpGenerate();
      if (forgotPasswordData.type && forgotPasswordData.type === 1) {
        userData = await db.findSingleDocument("user", {
          email: forgotPasswordData.email,
          status: 1,
        });
        if (userData !== null && Object.keys(userData) !== 0) {
          otpAdd = await db.findOneAndUpdate(
            "user",
            { _id: new ObjectId(userData._id) },
            { pwOtp: otp }
          );
          await forgotPasswordMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            url: "http://localhost:5173/change-password/" + userData._id + "/1",
            otp: otpAdd._doc.pwOtp,
          });

          return res.send({ status: 1, response: "Mail sent sucessfully" });
        } else {
          return res.send({ status: 1, response: "Mail sent sucessfully" });
        }
      } else if (forgotPasswordData.type && forgotPasswordData.type === 2) {
        userData = await db.findSingleDocument("internal", {
          email: forgotPasswordData.email,
          status: 1,
        });
        if (userData !== null && Object.keys(userData) !== 0) {
          otpAdd = await db.findOneAndUpdate(
            "internal",
            { _id: new ObjectId(userData._id) },
            { pwOtp: otp }
          );

          await forgotPasswordMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            url: "http://localhost:5173/change-password/" + userData._id + "/2",
            otp: otpAdd._doc.pwOtp,
          });

          return res.send({ status: 1, response: message.sendMail });
        } else {
          return res.send({ status: 1, response: message.sendMail });
        }
      }
      return res.send(data);
    } catch (error) {
      console.log(
        `Error in user controller - forgotPassword: ${error.message}`
      );
      res.send(error.message);
    }
  };

  //Change Forgot Password
  router.changeForgotPassword = async (req, res) => {
    let data = { status: 0, response: "Invalid request" };

    try {
      let passwordData = req.body,
        updatePassword,
        checkOtp;

      if (
        Object.keys(passwordData).length === 0 &&
        passwordData.data === undefined
      ) {
        res.send(data);

        return;
      }
      passwordData = passwordData.data[0];
      //   passwordData.password = common.decryptAPI(passwordData.password);

      if (!mongoose.isValidObjectId(passwordData.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }
      passwordData.password = bcrypt.hashSync(passwordData.password, 10); //password,salt

      if (passwordData.type && passwordData.type === 1) {
        checkOtp = await db.findSingleDocument("user", {
          _id: new ObjectId(passwordData.id),
          pwOtp: passwordData.otp,
        });
        if (checkOtp) {
          if (!checkOtp && Object.keys(checkOtp).length === 0) {
            return res.send({
              status: 0,
              response: message.forgotOtpmismatched,
            });
          }
        } else {
          return res.send(data);
        }

        updatePassword = await db.findByIdAndUpdate("user", passwordData.id, {
          password: passwordData.password,
          pwOtp: " ",
        });
        if (
          updatePassword.modifiedCount !== 0 &&
          updatePassword.matchedCount !== 0
        ) {
          await db.deleteOneDocument("sessionManagement", {
            userId: new ObjectId(passwordData.id),
          });

          return res.send({ status: 1, response: message.updatedSucess });
        }

        return res.send(data);
      } else if (passwordData.type && passwordData.type === 2) {
        checkOtp = await db.findOneDocumentExists("internal", {
          _id: new ObjectId(passwordData.id),
          pwOtp: passwordData.otp,
        });
        if (checkOtp === false) {
          return res.send({ status: 0, response: message.forgotOtpmismatched });
        }
        updatePassword = await db.findByIdAndUpdate(
          "internal",
          passwordData.id,
          {
            password: passwordData.password,
            pwOtp: " ",
          }
        );
        if (
          updatePassword.modifiedCount !== 0 &&
          updatePassword.matchedCount !== 0
        ) {
          //   await db.deleteOneDocument("sessionManagement", {
          //     userId: new ObjectId(passwordData.id),
          //   });
          //   event.eventEmitterInsert.emit("insert", "cfsClone", {
          //     originalId: passwordData.id,
          //     actionType: "update",
          //     data: passwordData,
          //   });

          return res.send({ status: 1, response: message.updatedSucess });
        }

        return res.send(data);
      }

      return res.send(data);
    } catch (error) {
      console.log(
        `Error in user controller - changeForgotPassword: ${error.message}`
      );
      res.send(error.message);
    }
  };

  //Insert Feed Back
  router.sendFeedBack = async (req, res) => {
    let data = { status: 0, response: "Invalid request" },
      feedBackData = req.body,
      insertFeedBack,
      userData;

    try {
      if (
        Object.keys(feedBackData).length === 0 &&
        feedBackData.data === undefined
      ) {
        res.send(data);

        return;
      }
      feedBackData = feedBackData.data[0];
      feedBackData.systemInfo = req.rawHeaders;

      insertFeedBack = await db.insertSingleDocument("feedBack", feedBackData);

      userData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(feedBackData.createdById) },
        { _id: 1, fullName: 1, email: 1 }
      );

      await feedBackSendMail({
        emailTo: userData.email,
        fullName: userData.fullName,
        // url: "http://localhost:5173/change-password/" + managerData._id + "/2",
      });

      return res.send({
        status: 1,
        response: "FeedBack Sent successfully ",
      });
    } catch (error) {
      return res.send(error.message);
    }
  };

  // Chat

  router.getAllChats = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketId,
      chatData,
      userData,
      chatDataArray = [];

    try {
      ticketId = req.body;
      if (Object.keys(ticketId).length === 0 && ticketId.data === undefined) {
        res.send(data);

        return;
      }
      ticketId = ticketId.data[0];
      if (!mongoose.isValidObjectId(ticketId.id)) {
        return res.send({ status: 0, response: message.invalidUserId });
      }

      chatData = await db.findDocuments(
        "chat",
        { ticketId: new ObjectId(ticketId) },
        { _id: 1, messageFrom: 1, content: 1, createdAt: 1 }
      );
      for (let i = 0; i < chatData.length; i++) {
        let singleChatData = {};
        singleChatData.id = `${chatData[i]._doc._id}`;
        singleChatData.message = {
          message: chatData[i]._doc.content,
          createdAt: chatData[i]._doc.createdAt,
        };
        singleChatData.senderId = `${chatData[i]._doc.messageFrom}`;
        userData = await db.findSingleDocument(
          "user",
          { _id: new ObjectId(chatData[i]._doc.messageFrom) },
          { fullName: 1 }
        );
        singleChatData.senderName = userData.fullName;

        chatDataArray = [...chatDataArray, singleChatData];
      }
      if (chatData.length !== 0) {
        return res.send({ status: 1, data: JSON.stringify(chatDataArray) });
      }

      return res.send({ status: 1, data: "[]" });
    } catch (error) {
      // logger.error(`Error in bokingmanagement controller - getBookingsbyScheduleId: ${error.message}`)
      res.send(error.message);
    }
  };

  //insert Chat
  router.insertChat = async (req, res) => {
    let data = { status: 0, response: message.inValid };

    try {
      let chatData = req.body,
        insertChat;

      if (Object.keys(chatData).length === 0 && chatData.data === undefined) {
        res.send(data);

        return;
      }

      chatData = chatData.data[0];
      // if (!mongoose.isValidObjectId(groupData.createdBy)) {

      //   return res.send({ status: 0, response: message.invalidUserId })
      // }
      chatData.systemInfo = req.rawHeaders;
      insertChat = await db.insertSingleDocument("chat", chatData);

      if (insertChat) {
        return res.send({ status: 1, response: message.chatSentSucess });
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

  //Inseert Eod

  router.insertEod = async (req, res) => {
    let data = { status: 0, response: "Invalid Request" },
      eodData = req.body,
      insertEod,
      managerId,
      managerData,
      userData,
      existingEod,
      ccMails;

    try {
      if (Object.keys(eodData).length === 0 && eodData.data === undefined) {
        return res.send(data);
      }
      eodData = eodData.data[0];
      eodData.systemInfo = req.rawHeaders;
      existingEod = await db.findSingleDocument("eod", {
        eodDate: eodData.eodDate,
      });
      managerId = await db.findSingleDocument(
        "group",
        { _id: new ObjectId(eodData.groupId) },
        { managedBy: 1, fullName: 1, _id: 1 }
      );

      managerData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(managerId.managedBy.toString()) },
        { fullName: 1, _id: 1, email: 1 }
      );

      userData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(eodData.createdBy) },
        { fullName: 1 }
      );

      if (managerId === null) {
        return res.send(data);
      }

      if (existingEod) {
        ccMails = [...new Set([...existingEod.ccMail, ...eodData.ccMail])];
        await db.findOneAndUpdate(
          "eod",
          { eodDate: eodData.eodDate },
          {
            $push: { eodSummary: { $each: eodData.eodSummary } },
            ccMail: ccMails,
          }
        );
        await eodMail({
          emailTo: managerData.email,
          fullName: managerData.fullName,
          mail: eodData.ccMail,
          userName: userData.fullName,
          url: `${process.env.UIURL}/user/managereodview`,
        });

        return res.send({ status: 1, response: "Updated the eod sucessfully" });
      }
      eodData.managedBy = managerId.managedBy.toString();

      insertEod = await db.insertSingleDocument("eod", eodData);

      if (insertEod) {
        await eodMail({
          emailTo: managerData.email,
          fullName: managerData.fullName,
          mail: eodData.ccMail,
          userName: userData.fullName,
          url: `${process.env.UIURL}/user/managereodview`,
        });
        return res.send({ status: 1, response: "Successfully inserted" });
      }

      res.send(data);
    } catch (error) {
      console.log(`Error in user controller - login: ${error.message}`);
      res.send(error.message);
    }
  };

  router.getEodsByUserId = async (req, res) => {
    let data = { status: 0, response: "Invalid Request" },
      eodPayload = req.body,
      eods;

    try {
      if (
        Object.keys(eodPayload).length === 0 &&
        eodPayload.data === undefined
      ) {
        return res.send(data);
      }
      eodPayload = eodPayload.data[0];
      eods = await db.findDocuments(
        "eod",
        { createdBy: new ObjectId(eodPayload.id) },
        { systemInfo: 0, updatedAt: 0 }
      );

      return res.send({ status: 1, data: JSON.stringify(eods) });
    } catch (error) {
      console.log(`Error in user controller - login: ${error.message}`);
      res.send(error.message);
    }
  };

  router.getEodsByManagerId = async (req, res) => {
    let data = { status: 0, response: "Invalid Request" },
      eodPayload = req.body,
      eods,
      startDate,
      endDate;

    try {
      if (
        Object.keys(eodPayload).length === 0 &&
        eodPayload.data === undefined
      ) {
        return res.send(data);
      }

      eodPayload = eodPayload.data[0];
      startDate = new Date(eodPayload.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(eodPayload.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      eods = await db.findDocuments(
        "eod",
        {
          managedBy: new ObjectId(eodPayload.managedBy),
          createdBy: new ObjectId(eodPayload.createdBy),
          eodDate: { $gte: startDate, $lte: endDate },
        },
        { systemInfo: 0, updatedAt: 0 }
      );
      return res.send({ status: 1, data: JSON.stringify(eods) });
    } catch (error) {
      console.log(`Error in user controller - login: ${error.message}`);
      res.send(error.message);
    }
  };

  router.getEodDetailsById = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      eodPayload = req.body,
      eodData;

    try {
      if (
        Object.keys(eodPayload).length === 0 &&
        eodPayload.data === undefined
      ) {
        res.send(data);

        return;
      }
      eodPayload = eodPayload.data[0];
      if (!mongoose.isValidObjectId(eodPayload.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }

      let existingEod = await db.findSingleDocument(
        "eod",
        { _id: new ObjectId(eodPayload.id) },
        { createdBy: 1, managedBy: 1 }
      );

      let token = req.headers.authorization;
      token = token.substring(7);

      decodedToken = jwt.decode(token);
      if (!decodedToken) {
        return res.status(401).send("Unauthorized");
      } else {
        if (
          !(
            decodedToken.userId !== existingEod.managedBy.toString() ||
            decodedToken.userId !== existingEod.createdBy.toString()
          )
        ) {
          return res.status(401).send("Unauthorized");
        }
      }

      eodData = await db.findDocuments(
        "eod",
        { _id: new ObjectId(eodPayload.id) },
        { systemInfo: 0, updatedAt: 0 }
      );

      if (eodData) {
        return res.send({ status: 1, data: JSON.stringify(eodData) });
      }

      res.send(data);
    } catch (error) {
      console.log(
        `Error in country controller - getCountryList: ${error.message}`
      );
      data.response = error.message;
      res.send(data);
    }
  };

  return router;
};
