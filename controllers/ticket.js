var db = require("../model/mongodb");
const common = require("../model/common");
const bcrypt = require("bcrypt");
const { transporter } = require("../model/mail");
const ejs = require("ejs");
const path = require("path");
const { message } = require("../model/message");
const { ObjectId } = require("bson");
const { default: mongoose } = require("mongoose");
const moment = require('moment');

module.exports = () => {
  let router = {}

  router.createTicket = async (req, res) => {
    let data = { status: 0, response: message.inValid },
      ticketData = req.body,
      insertTicket, filePath, folderPath, i = 0, arr = []

    try {
      if (Object.keys(ticketData).length === 0 && ticketData.data === undefined) {
        res.send(data);

        return;
      }
      ticketData = ticketData.data[0];
      ticketData.systemInfo = req.rawHeaders;
      ticketData.startTime = moment(ticketData.startTime)
      ticketData.endTime = moment(ticketData.endTime)
      ticketData.actualEndTime = moment(ticketData.actualEndTime)
      if (ticketData.actualEndTime) {
        ticketData.timeLog = ticketData.actualEndTime.diff(ticketData.startTime, 'hours') + " hours"
      } else {
        ticketData.timeLog = ticketData.endTime.diff(ticketData.startTime, 'hours') + " hours"
      }

      insertTicket = await db.insertSingleDocument("ticket", ticketData)
      if (insertTicket) {
        if (ticketData.files) {
          folderPath = path.join(__dirname, `../fileUploads/${insertTicket._id}`)
          common.createDir(folderPath)
          for (; i < ticketData.files.length; i++) {
            filePath = `${folderPath}/${ticketData.files[i].fileName}`
            common.createFile(filePath, ticketData.files[i].fileData.split(',')[1], "base64")
            arr.push(filePath)
          }
          await db.findByIdAndUpdate("ticket", insertTicket._id, { files: arr })
        }

        return res.send({ status: 1, response: message.ticketInserted });
      }

      return res.send(data)
    } catch (error) {
      return res.send(error.message);
    }
  }

  router.updateTicket = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ticketData = req.body, updateTicket

    try {

      if (Object.keys(ticketData).length === 0 && ticketData.data === undefined) {
        res.send(data)

        return
      }
      ticketData = ticketData.data[0]
      if (!mongoose.isValidObjectId(ticketData.id)) {

        return res.send({ status: 0, response: message.invalidId })
      }

      ticketData.systemInfo = req.rawHeaders
      ticketData = ticketData.data[0];
      ticketData.systemInfo = req.rawHeaders;
      ticketData.startTime = moment(ticketData.startTime, 'DD-MM-YYYYTHH:mm:ss')
      ticketData.endTime = moment(ticketData.endTime, 'DD-MM-YYYYTHH:mm:ss')
      ticketData.actualEndTime = moment(ticketData.actualEndTime, 'DD-MM-YYYYTHH:mm:ss')
      if (ticketData.actualEndTime) {
        ticketData.timeLog = ticketData.actualEndTime.diff(ticketData.startTime, 'hours') + " hours"
      } else {
        ticketData.timeLog = ticketData.endTime.diff(ticketData.startTime, 'hours') + " hours"
      }

      updateTicket = await db.updateOneDocument("ticket", { _id: new ObjectId(ticketData.id), status: { $in: [1, 2] } }, ticketData)
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

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 1, response: message.notFoundCountry })
      }
    } catch (error) {
      console.log(`Error in ticket controller - updateTicket: ${error.message}`)
      data.response = error.message
      //   if (error.code === 11000) {
      //     data.response = "Duplicates found"
      //   }
      //   else {
      //     data.response = error.message
      //   }
      res.send(data)
    }
  }

  router.getTicketsByUserId = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ticketData = req.body, ticketsData

    try {
      if (Object.keys(ticketData).length === 0 && ticketData.data === undefined) {
        res.send(data)

        return
      }
      ticketData = ticketData.data[0]
      if (!mongoose.isValidObjectId(ticketData.id)) {

        return res.send({ status: 0, response: message.invalidId })
      }
      ticketsData = await db.findAndSelect("ticket", { createdBy: new ObjectId(ticketData.id), status: { $in: [1, 2] } }, { systemInfo: 0, updatedAt: 0 })
      if (ticketsData) {

        return res.send({ status: 1, data: JSON.stringify(ticketsData) })
      }
    } catch (error) {
      console.log(`Error in country controller - getCountryList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  return router
}