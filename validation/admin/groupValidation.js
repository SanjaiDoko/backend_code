//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function(app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    validator.registerUser =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.fullName').trim().notEmpty().withMessage('fullName cannot be empty'),
        check('data.*.mobileNumber').trim().notEmpty().isNumeric().withMessage('Mobile Number cannot be empty & should be Numeric'),
        check('data.*.mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Mobile Number Should be 10 digit'),
        check('data.*.email').trim().notEmpty().isEmail().withMessage('Email cannot be empty & should be a valid Field'),
        check('data.*.password').trim().notEmpty().withMessage('Password cannot be empty'),
        check('data.*.password').isLength({ min: 8, max: 16 }).withMessage('Password should be min 8 char and max 16 char'),
        (req, res, next) => {
            const errors = validationResult(req).array()
            if (errors.length > 0) {

                return res.send({ status: 0, response: errors[0].msg })
            }

            return next()
        }
    ]

    validator.checkId = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    validator.insertGroup =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.name').notEmpty().withMessage('Group name cannot be empty'),
        check('data.*.managedBy').notEmpty().withMessage('managedBy cannot be empty'),
        // check('data.*.users').notEmpty().withMessage('Destination cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array()
            if (errors.length > 0) {

                return res.send({ status: 0, response: errors[0].msg })
            }

            return next()
        }
    ]

    validator.updateGroup =
    [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id cannot be empty'),
        check('data.*.name').notEmpty().withMessage('Group name cannot be empty'),
        check('data.*.managedBy').notEmpty().withMessage('ManagedBy cannot be empty'),
        check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
        // check('data.*.users').notEmpty().withMessage('Destination cannot be empty'),
        (req, res, next) => {
            const errors = validationResult(req).array()
            if (errors.length > 0) {

                return res.send({ status: 0, response: errors[0].msg })
            }

            return next()
        }
    ]

 
    return validator;
}