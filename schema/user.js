let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//User Schema
let userSchema = mongoose.Schema({
 
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: Number,                // 1 - user, 2 - admin
        default: 1
    },
    pwOtp: {
        type: String,
        trim: true
    },
    createdBy: {
        type: ObjectId
    },
    systemInfo: {
        type: Object
    },
    loginTime: {
        type: Date
    },
    logoutTime: {
        type: Date
    },
    status: {           // 1 - active user, 2 - deactive user
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("user", userSchema);

