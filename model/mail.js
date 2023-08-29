var nodemailer = require('nodemailer')
// const CONFIG = require('../config/config.js')

const transporter = nodemailer.createTransport({
  service: "Gmail",
  // host: 'localhost',
  // port: 587,
  // pool: true,
  // maxConnections: 3,
  // maxMessages: 100,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

module.exports = { transporter }