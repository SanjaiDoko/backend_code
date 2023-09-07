//Imports
const { check, validationResult } = require("express-validator");

//User Validation
module.exports = function (app, io) {
  let data = { status: 0, response: "Invalid Request" },
    validator = {};

  validator.checkId = [
    check("data").notEmpty().withMessage("Data cannot be empty"),
    check("data.*.id").notEmpty().withMessage("Id is required field"),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length > 0) {
        data.response = errors[0].msg;

        return res.send(data);
      }

      return next();
    },
  ];

  validator.createTicket = [
    check("data").notEmpty().withMessage("Data cannot be empty"),
    check("data.*.issueName")
      .trim()
      .notEmpty()
      .withMessage("IssueName cannot be empty"),
    check("data.*.type").trim().notEmpty().withMessage("Type cannot be empty"),
    check("data.*.issueDescription")
      .trim()
      .notEmpty()
      .withMessage("Issue description cannot be empty"),
    check("data.*.createdBy")
      .trim()
      .notEmpty()
      .withMessage("CreatedBy cannot be empty"),
    check("data.*.managedBy")
      .trim()
      .notEmpty()
      .withMessage("ManagedBy cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length > 0) {
        return res.send({ status: 0, response: errors[0].msg });
      }

      return next();
    },
  ];

  validator.updateTicket = [
    check("data").notEmpty().withMessage("Data cannot be empty"),
    check("data.*.id").trim().notEmpty().withMessage("id cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req).array();
      if (errors.length > 0) {
        return res.send({ status: 0, response: errors[0].msg });
      }

      return next();
    },
  ];

  return validator;
};
