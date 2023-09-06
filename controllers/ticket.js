var db = require("../model/mongodb");
const common = require("../model/common");
const { transporter } = require("../model/mail");
const ejs = require("ejs");
const path = require("path");
const { message } = require("../model/message");
const { ObjectId } = require("bson");
const { default: mongoose } = require("mongoose");
const moment = require("moment");

module.exports = () => {
  let router = {},
    mailResendAttempts = 2;
  let templatePathUser = path.resolve("./templates/ticket/");

  const ticketSendMail = async (mailData) => {
    ejs.renderFile(
      `${templatePathUser}/createTicket.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        url: mailData.url,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_USER,
            to: mailData.emailTo,
            subject: `CRM | Ticket assigned`,
            html: data,
            cc: mailData.mail,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                ticketSendMail(mailData);
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

  const feedBackTicketMail = async (mailData) => {
    ejs.renderFile(
      `${templatePathUser}/feedbackTicket.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        url: mailData.url,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_USER,
            to: mailData.emailTo,
            subject: `CRM | Feedback of Ticket`,
            html: data,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                feedBackTicketMail(mailData);
                mailResendAttempts--;
              } else {
                mailResendAttempts = 2;
              }
              console.log(`Feedback Ticket Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Completed Ticket Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
  };

  const completeTicketMail = async (mailData) => {
    ejs.renderFile(
      `${templatePathUser}/completeTicket.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        url: mailData.url,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: process.env.SMTP_USER,
            to: mailData.emailTo,
            subject: `CRM | Completed Ticket`,
            html: data,
            cc: mailData.mail,
          };

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              if (mailResendAttempts !== 0) {
                completeTicketMail(mailData);
                mailResendAttempts--;
              } else {
                mailResendAttempts = 2;
              }
              console.log(`Complete Ticket Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Complete Ticket Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
  };

  router.createTicket = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      insertTicket,
      managerData,
      filePath,
      folderPath,
      i = 0,
      arr = [],
      fileName,
      fileFolderPath,
      ticketDocsData,
      store = [],
      groupName;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      ticketData.systemInfo = req.rawHeaders;

      managerData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(ticketData.managedBy) },
        { email: 1, fullName: 1 }
      );

      ticketDocsData = await db.findDocuments("ticket", {});

      groupData = await db.findSingleDocument(
        "group",
        { _id: new ObjectId(ticketData.issueGroup) },
        { name: 1, _id: 1 }
      );
      groupName = groupData.name.replace(/\s+/g, "");

      if (ticketDocsData.length > 0) {
        ticketDocsData.forEach((ticket) => {
          let ticketIdArr = ticket.ticketId.slice(1).split("-");
          if (ticketIdArr.includes(groupName)) {
            store.push(ticket.ticketId);
          } else {
            ticketData.ticketId = "#" + groupName + "-01";
          }
        });
      } else {
        ticketData.ticketId = "#" + groupName + "-01";
      }

      if (store.length > 0) {
        ticketData.ticketId =
          "#" + groupName + "-" + String(store.length + 1).padStart(2, "0");
      }

      insertTicket = await db.insertSingleDocument("ticket", ticketData);

      if (insertTicket) {
        if (ticketData.files) {
          folderPath = path.join(
            __dirname,
            `../fileUploads/${insertTicket._id}`
          );

          common.createDir(folderPath);

          for (; i < ticketData.files.length; i++) {
            filePath = `${folderPath}/${ticketData.files[i].fileName}`;

            common.createFile(
              filePath,
              ticketData.files[i].fileData.split(",")[1],
              "base64"
            );
            fileFolderPath = filePath.split("\\fileUploads\\").pop();
            fileName = filePath.split("/")[1];

            filePath = {
              fileName: fileName,
              filePath: `fileUploads/${fileFolderPath}`,
            };
            arr.push(filePath);
          }
          await db.findByIdAndUpdate("ticket", insertTicket._id, {
            files: arr,
          });
        }
        // return res.send({ status: 1, response: message.ticketInserted });
      }

      await ticketSendMail({
        emailTo: managerData.email,
        fullName: managerData.fullName,
        mail: [...ticketData?.mailList],
        url: process.env.UIURL + "/user/updatemanageticket/" + insertTicket._id,
      });
      return res.send({
        status: 1,
        response: "successfully inserted",
      });
    } catch (error) {
      return res.send(error.message);
    }
  };

  router.updateTicket = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      updateTicket,
      assignedNameData,
      existingTicket,
      managerData,
      ticketCreator;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];

      if (!mongoose.isValidObjectId(ticketData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }

      existingTicket = await db.findSingleDocument("ticket", {
        _id: new ObjectId(ticketData.id),
      });

      assignedNameData = await db.findSingleDocument(
        "user",
        { _id: new ObjectId(ticketData.assignedTo) },
        { email: 1, fullName: 1 }
      );

      if (!existingTicket) {
        return res.send({ status: 0, response: "Invalid ticket id" });
      }

      if (ticketData.endTime) {
        ticketData.endTime = moment(ticketData.endTime, "DD-MM-YYYYTHH:mm:ss");
      }

      if (ticketData.actualEndTime) {
        ticketData.endTime = moment(ticketData.actualEndTime);
      }

      if (ticketData.assignedTo && existingTicket.assignedMail) {
        ticketData.startTime = moment().format("MM-DD-YYYY");
        await ticketSendMail({
          emailTo: assignedNameData.email,
          fullName: assignedNameData.fullName,
          mail: ticketData.mailList,
          url: process.env.UIURL + "/user/dashboard/" + ticketData._id,
        });
        ticketData.status = 2;
        ticketData.assignedMail = 1;
      }

      if (ticketData.status === 1) {
        managerData = await db.findSingleDocument(
          "user",
          { _id: new ObjectId(ticketData.managedBy) },
          { email: 1, fullName: 1 }
        );

        ticketCreator = await db.findSingleDocument(
          "user",
          { _id: new ObjectId(ticketData.createdBy) },
          { email: 1, fullName: 1 }
        );
        let mailArray = [
          ...existingTicket.mailList,
          assignedNameData.email,
          managerData.email,
        ];
        await feedBackTicketMail({
          emailTo: ticketCreator.email,
          fullName: ticketCreator.fullName,
          url: process.env.UIURL + "/user/dashboard/" + ticketData.id,
        });

        await completeTicketMail({
          emailTo: ticketCreator.email,
          fullName: ticketCreator.fullName,
          mail: mailArray,
          url: process.env.UIURL + "/user/editticket/" + ticketData.id,
        });
      }

      updateTicket = await db.findOneAndUpdate(
        "ticket",
        { _id: new ObjectId(ticketData.id), status: { $in: [1, 2, 0, 3] } },
        ticketData
      );

      if (updateTicket.modifiedCount !== 0 && updateTicket.matchedCount !== 0) {
        return res.send({ status: 1, response: message.updatedSucess });
      } else {
        return res.send({ status: 1, response: message.notFoundCountry });
      }
    } catch (error) {
      console.log(
        `Error in ticket controller - updateTicket: ${error.message}`
      );
      data.response = error.message;
      res.send(data);
    }
  };

  router.getTicketById = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      ticketsData;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      if (!mongoose.isValidObjectId(ticketData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }
      condition = {
        _id: new ObjectId(ticketData.id),
        status: { $in: [1, 2, 0, 3] },
      };
      const aggregationQuery = [
        {
          $lookup: {
            from: "users",
            localField: "managedBy",
            foreignField: "_id",
            as: "managerDetails",
          },
        },
        {
          $unwind: "$managerDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedDetails",
          },
        },
        {
          $unwind: {
            path: "$assignedDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: condition,
        },
        {
          $project: {
            _id: 1,
            managerName: "$managerDetails.fullName",
            managerId: "$managerDetails._id",
            issueName: 1,
            type: 1,
            issueDescription: 1,
            mailList: 1,
            status: 1,
            createdAt: 1,
            issueGroup: 1,
            assignedName: "$assignedDetails.fullName",
            assignedTo: "$assignedDetails._id",
            mailList: 1,
            files: 1,
            endTime: 1,
            actualEndTime: 1,
            timeLog: 1,
            ticketId: 1,
          },
        },
      ];

      ticketsData = await db.getAggregation("ticket", aggregationQuery);

      if (ticketsData) {
        return res.send({ status: 1, data: JSON.stringify(ticketsData) });
      }
    } catch (error) {
      console.log(
        `Error in country controller - getCountryList: ${error.message}`
      );
      data.response = error.message;
      res.send(data);
    }
  };

  router.getTicketsByUserId = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      ticketsData;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      if (!mongoose.isValidObjectId(ticketData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }
      condition = {
        createdBy: new ObjectId(ticketData.id),
        status: { $in: [1, 2, 0, 3] },
      };
      const aggregationQuery = [
        {
          $lookup: {
            from: "users",
            localField: "managedBy",
            foreignField: "_id",
            as: "managerDetails",
          },
        },
        {
          $unwind: "$managerDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedDetails",
          },
        },
        {
          $unwind: {
            path: "$assignedDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: condition,
        },
        {
          $project: {
            _id: 1,
            managerName: "$managerDetails.fullName",
            managerId: "$managerDetails._id",
            issueName: 1,
            type: 1,
            issueDescription: 1,
            mailList: 1,
            status: 1,
            createdAt: 1,
            issueGroup: 1,
            assignedName: "$assignedDetails.fullName",
            assignedId: "$assignedDetails._id",
            mailList: 1,
            files: 1,
            timeLog: 1,
            status: 1,
            ticketId: 1
          },
        },
      ];

      ticketsData = await db.getAggregation("ticket", aggregationQuery);

      if (ticketsData) {
        return res.send({ status: 1, data: JSON.stringify(ticketsData) });
      }
    } catch (error) {
      console.log(
        `Error in country controller - getCountryList: ${error.message}`
      );
      data.response = error.message;
      res.send(data);
    }
  };

  router.getAllRecievedTicketsByUserId = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      ticketsData,
      condition;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      if (!mongoose.isValidObjectId(ticketData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }

      condition = {
        assignedTo: new ObjectId(ticketData.id),
        status: { $in: [1, 2, 0, 3] },
      };

      const aggregationQuery = [
        {
          $lookup: {
            from: "users",
            localField: "managedBy",
            foreignField: "_id",
            as: "managerDetails",
          },
        },
        {
          $unwind: "$managerDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedDetails",
          },
        },
        {
          $unwind: {
            path: "$assignedDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: condition,
        },
        {
          $project: {
            _id: 1,
            managerName: "$managerDetails.fullName",
            managerId: "$managerDetails._id",
            assignedId: "$assignedDetails._id",
            issueName: 1,
            type: 1,
            issueDescription: 1,
            mailList: 1,
            status: 1,
            createdAt: 1,
            issueGroup: 1,
            assignedName: "$assignedDetails.fullName",
            mailList: 1,
            files: 1,
            endTime: 1,
            timeLog: 1,
            ticketId: 1
          },
        },
      ];

      ticketsData = await db.getAggregation("ticket", aggregationQuery);

      if (ticketsData) {
        return res.send({ status: 1, data: JSON.stringify(ticketsData) });
      }
    } catch (error) {
      console.log(`Error in ticket controller : ${error.message}`);
      data.response = error.message;
      res.send(data);
    }
  };

  router.getAllRecievedTicketsManagerId = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      ticketsData,
      condition;

    try {
      if (
        Object.keys(ticketData).length === 0 &&
        ticketData.data === undefined
      ) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      if (!mongoose.isValidObjectId(ticketData.id)) {
        return res.send({ status: 0, response: message.invalidId });
      }

      condition = {
        managedBy: new ObjectId(ticketData.id),
        status: { $in: [1, 2, 0, 3] },
      };
      const aggregationQuery = [
        {
          $lookup: {
            from: "users",
            localField: "managedBy",
            foreignField: "_id",
            as: "managerDetails",
          },
        },
        {
          $unwind: "$managerDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedDetails",
          },
        },
        {
          $unwind: {
            path: "$assignedDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "groups",
            localField: "issueGroup",
            foreignField: "_id",
            as: "groupdetails",
          },
        },
        {
          $unwind: {
            path: "$groupdetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: condition,
        },
        {
          $project: {
            _id: 1,
            managerName: "$managerDetails.fullName",
            managerId: "$managerDetails._id",
            assignedId: "$assignedDetails._id",
            issueName: 1,
            type: 1,
            issueDescription: 1,
            mailList: 1,
            status: 1,
            createdAt: 1,
            issueGroup: 1,
            assignedName: "$assignedDetails.fullName",
            mailList: 1,
            endTime: 1,
            timeLog: 1,
            issueGroupName: "$groupdetails.name",
            ticketId: 1
          },
        },
      ];

      ticketsData = await db.getAggregation("ticket", aggregationQuery);

      if (ticketsData) {
        return res.send({ status: 1, data: JSON.stringify(ticketsData) });
      }
    } catch (error) {
      console.log(`Error in ticket controller : ${error.message}`);
      data.response = error.message;
      res.send(data);
    }
  };

  return router;
};
