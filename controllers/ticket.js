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
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            subject: `CRM | Ticket assigned`,
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
              console.log(`Create Ticket Mail Not Sent - ${error}`);
              return console.log(error);
            }
            console.log(`Create Ticket Mail sent:  - ${info.messageId}`);
          });
        }
      }
    );
  };

  router.createTicket = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      insertTicket, managerData

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
      ticketData.startTime = moment(
        ticketData.startTime,
        "DD-MM-YYYYTHH:mm:ss"
      );
      ticketData.endTime = moment(ticketData.endTime, "DD-MM-YYYYTHH:mm:ss");
      ticketData.actualEndTime = moment(
        ticketData.actualEndTime,
        "DD-MM-YYYYTHH:mm:ss"
      );
      if (ticketData.actualEndTime) {
        ticketData.timeLog =
          ticketData.actualEndTime.diff(ticketData.startTime, "hours") +
          " hours";
      } else {
        ticketData.timeLog =
          ticketData.endTime.diff(ticketData.startTime, "hours") + " hours";
      }

      insertTicket = await db.insertSingleDocument("ticket", ticketData);

      managerData = await db.findSingleDocument("user", {_id: new ObjectId(ticketData.managedBy)},{email:1,fullName:1})

      await ticketSendMail({
        emailTo: managerData.email,
        fullName: managerData.fullName,
        url: "http://localhost:5173/change-password/" + managerData._id + "/2",
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
      updateTicket;

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

      ticketData.systemInfo = req.rawHeaders;

      ticketData.systemInfo = req.rawHeaders;
      ticketData.startTime = moment(
        ticketData.startTime,
        "DD-MM-YYYYTHH:mm:ss"
      );
      ticketData.endTime = moment(ticketData.endTime, "DD-MM-YYYYTHH:mm:ss");
      ticketData.actualEndTime = moment(
        ticketData.actualEndTime,
        "DD-MM-YYYYTHH:mm:ss"
      );
      if (ticketData.actualEndTime) {
        ticketData.timeLog =
          ticketData.actualEndTime.diff(ticketData.startTime, "hours") +
          " hours";
      } else {
        ticketData.timeLog =
          ticketData.endTime.diff(ticketData.startTime, "hours") + " hours";
      }
      updateTicket = await db.updateOneDocument(
        "ticket",
        { _id: new ObjectId(ticketData.id), status: { $in: [1, 2] } },
        ticketData
      );
      if (updateTicket.modifiedCount !== 0 && updateTicket.matchedCount !== 0) {
        // event.eventEmitterInsert.emit(
        //   'insert',
        //   'countryClone',
        //   {
        //     "originalId": ticketData.id,
        //     "actionType": 'update',
        //     "data": ticketData
        //   }
        // )

        return res.send({ status: 1, response: message.updatedSucess });
      } else {
        return res.send({ status: 1, response: message.notFoundCountry });
      }
    } catch (error) {
      console.log(
        `Error in ticket controller - updateTicket: ${error.message}`
      );
      data.response = error.message;
      //   if (error.code === 11000) {
      //     data.response = "Duplicates found"
      //   }
      //   else {
      //     data.response = error.message
      //   }
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
      condition = { createdBy: new ObjectId(ticketData.id), status: { $in: [1, 2] } }
      const aggregationQuery = [
        {
          $lookup: {
            from: "users",
            localField: "managedBy",
            foreignField: "_id",
            as: "managerDetails"
          }
        },
        {
          $unwind: "$managerDetails"
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedDetails"
          }
        },
        {
          $unwind: { path: "$assignedDetails", preserveNullAndEmptyArrays: true }
        },
        {
          $match: condition
        },
        {
          $project: {
            _id: 1,
            managerName: '$managerDetails.fullName',
            issueName: 1,
            type: 1,
            issueDescription: 1,
            mailList: 1,
            status: 1,
            createdAt: 1,
            issueGroup: 1,
            assignedName: '$assignedDetails.fullName'
          }
        }
      ];
      

      
      ticketsData = await db.getAggregation('ticket', aggregationQuery)
 
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
      if (ticketData.role === 1) {
        condition = { assignedTo: new ObjectId(ticketData.id), status: { $in: [1, 2] } }

        const aggregationQuery = [
          {
            $lookup: {
              from: "users",
              localField: "managedBy",
              foreignField: "_id",
              as: "managerDetails"
            }
          },
          {
            $unwind: "$managerDetails"
          },
          {
            $lookup: {
              from: "users",
              localField: "assignedTo",
              foreignField: "_id",
              as: "assignedDetails"
            }
          },
          {
            $unwind: { path: "$assignedDetails", preserveNullAndEmptyArrays: true }
          },
          {
            $match: condition
          },
          {
            $project: {
              _id: 1,
              managerName: '$managerDetails.fullName',
              issueName: 1,
              type: 1,
              issueDescription: 1,
              mailList: 1,
              status: 1,
              createdAt: 1,
              issueGroup: 1,
              assignedName: '$assignedDetails.fullName'
            }
          }
        ];
              
        ticketsData = await db.getAggregation('ticket', aggregationQuery)
        // ticketsData = await db.findAndSelect(
        //   "ticket",
        //   { assignedTo: new ObjectId(ticketData.id), status: { $in: [1, 2] } },
        //   { systemInfo: 0, updatedAt: 0 }
        // );
      } else if (ticketData.role === 3) {
        condition = { managedBy: new ObjectId(ticketData.id), status: { $in: [1, 2] } }

        const aggregationQuery = [
          {
            $lookup: {
              from: "users",
              localField: "managedBy",
              foreignField: "_id",
              as: "managerDetails"
            }
          },
          {
            $unwind: "$managerDetails"
          },
          {
            $lookup: {
              from: "users",
              localField: "assignedTo",
              foreignField: "_id",
              as: "assignedDetails"
            }
          },
          {
            $unwind: { path: "$assignedDetails", preserveNullAndEmptyArrays: true }
          },
          {
            $match: condition
          },
          {
            $project: {
              _id: 1,
              managerName: '$managerDetails.fullName',
              issueName: 1,
              type: 1,
              issueDescription: 1,
              mailList: 1,
              status: 1,
              createdAt: 1,
              issueGroup: 1,
              assignedName: '$assignedDetails.fullName'
            }
          }
        ];
              
        ticketsData = await db.getAggregation('ticket', aggregationQuery)
        // ticketsData = await db.findAndSelect(
        //   "ticket",
        //   { managedBy: new ObjectId(ticketData.id), status: { $in: [1, 2] } },
        //   { systemInfo: 0, updatedAt: 0 }
        // );
      } else {
        return res.send({ status: 0, response: "Invalid role" });
      }

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

  return router;
};
