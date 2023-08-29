//Imports
const { check, validationResult } = require('express-validator')

//User Validation
module.exports = function (app, io) {
    let data = { status: 0, response: 'Invalid Request' }, validator = {}

    // validator.checkId = [
    //     check('data').notEmpty().withMessage('Data cannot be empty'),
    //     check('data.*.id').notEmpty().withMessage('Id is required field'),
    //     (req, res, next) => {
    //         const errors = validationResult(req).array();
    //         if (errors.length > 0) {
    //             data.response = errors[0].msg;

    //             return res.send(data);
    //         }

    //         return next();
    //     }
    // ]

    // validator.checkUserId = [
    //     check('data').notEmpty().withMessage('Data cannot be empty'),
    //     check('data.*.userId').notEmpty().withMessage('userId is required field'),
    //     (req, res, next) => {
    //         const errors = validationResult(req).array();
    //         if (errors.length > 0) {
    //             data.response = errors[0].msg;

    //             return res.send(data);
    //         }

    //         return next();
    //     }
    // ]

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

    // validator.addUser =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.userId').trim().notEmpty().withMessage('userId cannot be empty'),
    //         check('data.*.fullName').trim().notEmpty().withMessage('fullName cannot be empty'),
    //         check('data.*.legalName').trim().notEmpty().withMessage('legalName cannot be empty'),
    //         check('data.*.mobileCode').trim().notEmpty().withMessage('Mobile Code cannot be empty'),
    //         check('data.*.mobileNumber').trim().notEmpty().isNumeric().withMessage('Mobile Number cannot be empty & should be Numeric'),
    //         check('data.*.mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Mobile Number Should be 10 digit'),
    //         check('data.*.email').trim().notEmpty().isEmail().withMessage('Email cannot be empty & should be a valid Field'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    validator.loginUser =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.email').trim().notEmpty().isEmail().withMessage('Email cannot be empty & should be a valid Field'),
            check('data.*.password').trim().notEmpty().withMessage('Password cannot be empty'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    validator.checkEmail =
        [
            check('data').notEmpty().withMessage('Data cannot be empty'),
            check('data.*.email').trim().notEmpty().isEmail().withMessage('Email cannot be empty & should be a valid Field'),
            (req, res, next) => {
                const errors = validationResult(req).array()
                if (errors.length > 0) {

                    return res.send({ status: 0, response: errors[0].msg })
                }

                return next()
            }
        ]

    // validator.checkOtp =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.id').notEmpty().withMessage('id cannot be empty'),
    //         check('data.*.otp').notEmpty().isNumeric().withMessage('otp cannot be empty & only numeric'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    // validator.checkUserDetails =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.userId').notEmpty().withMessage('userId cannot be empty'),
    //         check('data.*.legalName').notEmpty().withMessage('legalName cannot be empty'),
    //         check('data.*.country').notEmpty().withMessage('country cannot be empty'),
    //         check('data.*.state').notEmpty().withMessage('state cannot be empty'),
    //         check('data.*.city').notEmpty().withMessage('city cannot be empty'),
    //         check('data.*.gstFileName').notEmpty().withMessage('gstFileName cannot be empty'),
    //         check('data.*.gstNumber').notEmpty().withMessage('gstNumber cannot be empty'),
    //         check('data.*.gstFilePath').notEmpty().withMessage('gstFilePath cannot be empty'),
    //         check('data.*.pan').notEmpty().withMessage('pan cannot be empty'),
    //         check('data.*.mto').notEmpty().withMessage('mto cannot be empty'),
    //         check('data.*.blCopyName').notEmpty().withMessage('blCopyName cannot be empty'),
    //         check('data.*.blCopyPath').notEmpty().withMessage('blCopyPath cannot be empty'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    // validator.updateUserStatus =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.id').notEmpty().withMessage('id cannot be empty'),
    //         check('data.*.status').notEmpty().withMessage('Status cannot be empty'),
    //         check('data.*.reason').notEmpty().withMessage('Reason cannot be empty'),
    //         check('data.*.reason.message').notEmpty().withMessage('Message - Message cannot be empty'),
    //         check('data.*.reason.role').notEmpty().withMessage('Message - Role cannot be empty'),
    //         check('data.*.reason.time').notEmpty().withMessage('Message - Time cannot be empty'),
    //         check('data.*.reason.status').notEmpty().withMessage('Message - Status cannot be empty'),
    //         check('data.*.reason.id').notEmpty().withMessage('reason - Id cannot be empty'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    validator.forgotPassword = [
        check('data').notEmpty().withMessage('Data cannot be empty'),
        check('data.*.id').notEmpty().withMessage('Id is required field'),
        check('data.*.password').trim().notEmpty().withMessage('Password cannot be empty'),
        check('data.*.otp').trim().notEmpty().withMessage('otp cannot be empty'),
        check('data.*.otp').isLength({ min: 6, max: 6 }).withMessage('otp should be 6 char'),
        // check('data.*.password').isLength({ min: 8, max: 16 }).withMessage('Password should be min 8 char and max 16 char'),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;

                return res.send(data);
            }

            return next();
        }
    ]

    // validator.userGateway = [
    //     check('data').notEmpty().withMessage('Data cannot be empty'),
    //     check('data.*.userId').notEmpty().withMessage('userId is required field'),
    //     check('data.*.preferredGateway').trim().notEmpty().withMessage('preferredGateway cannot be empty'),
    //     (req, res, next) => {
    //         const errors = validationResult(req).array();
    //         if (errors.length > 0) {
    //             data.response = errors[0].msg;

    //             return res.send(data);
    //         }

    //         return next();
    //     }
    // ]

    // validator.checkChangePassword = [
    //     check('data').notEmpty().withMessage('Data cannot be empty'),
    //     check('data.*.id').notEmpty().withMessage('Id is required field'),
    //     check('data.*.password').trim().notEmpty().withMessage('Password cannot be empty'),
    //     check('data.*.password').isLength({ min: 8, max: 16 }).withMessage('Password should be min 8 char and max 16 char'),
    //     check('data.*.currentPassword').notEmpty().withMessage('Currentpassword is required field'),
    //     (req, res, next) => {
    //         const errors = validationResult(req).array();
    //         if (errors.length > 0) {
    //             data.response = errors[0].msg;

    //             return res.send(data);
    //         }

    //         return next();
    //     }
    // ]
    // validator.edituser =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.id').notEmpty().withMessage('id cannot be empty'),
    //         check('data.*.fullName').trim().notEmpty().withMessage('fullName cannot be empty'),
    //         check('data.*.designation').trim().notEmpty().withMessage('Designation cannot be empty'),
    //         check('data.*.mobileCode').trim().notEmpty().withMessage('Mobile Code cannot be empty'),
    //         check('data.*.mobileNumber').trim().notEmpty().isNumeric().withMessage('Mobile Number cannot be empty & should be Numeric'),
    //         check('data.*.mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Mobile Number Should be 10 digit'),
    //         check('data.*.email').trim().notEmpty().isEmail().withMessage('Email cannot be empty & should be a valid Field'),
    //         check('data.*.password').trim().notEmpty().withMessage('Password cannot be empty'),
    //         check('data.*.password').isLength({ min: 8, max: 16 }).withMessage('Password should be min 8 char and max 16 char'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    // validator.checkEditField =
    //     [
    //         check('data').notEmpty().withMessage('Data cannot be empty'),
    //         check('data.*.id').notEmpty().withMessage('id cannot be empty'),
    //         check('data.*.fullName').trim().notEmpty().withMessage('fullName cannot be empty'),
    //         check('data.*.mobileNumber').trim().notEmpty().isNumeric().withMessage('Mobile Number cannot be empty & should be Numeric'),
    //         check('data.*.mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Mobile Number Should be 10 digit'),
    //         (req, res, next) => {
    //             const errors = validationResult(req).array()
    //             if (errors.length > 0) {

    //                 return res.send({ status: 0, response: errors[0].msg })
    //             }

    //             return next()
    //         }
    //     ]

    return validator;
}