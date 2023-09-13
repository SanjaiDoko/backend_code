const { check, validationResult } = require("express-validator");

module.exports = function () {
    let data = { status: 0, response: "Invalid Request" },
      validator = {};

      validator.checkRoom = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.roomName").notEmpty().withMessage("Room name is required field"),
        check("data.*.roomNo").notEmpty().withMessage("Room no is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];

      validator.checkDeactivate = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("Room id is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];

      validator.checkUpdateRoom = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("Room id is required field"),
        check("data.*.roomName").notEmpty().withMessage("Room Name is required field"),
        check("data.*.roomNo").notEmpty().withMessage("Room Number is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];

      validator.checkCreateBooking = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.roomId").notEmpty().withMessage("Room id is required field"),
        check("data.*.bookedBy").notEmpty().withMessage("User booking is required field"),
        check("data.*.bookedFor").notEmpty().withMessage("Reason for booking is required field"),
        check("data.*.headCount").notEmpty().withMessage("Head count is required field"),
        check("data.*.startsAt").notEmpty().withMessage("Start time is required field"),
        check("data.*.endsAt").notEmpty().withMessage("End time is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];

      validator.cancelBooking = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("Booking id is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];

      validator.getMyBookings = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("User id is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];


      validator.getRoom = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("Room id is required field"),
        (req, res, next) => {
          const errors = validationResult(req).array();
          if (errors.length > 0) {
            data.response = errors[0].msg;
            return res.send(data);
          }
          return next();
        },
      ];


      return validator

}