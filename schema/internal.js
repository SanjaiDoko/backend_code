let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//Internal Schema
let internalSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
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
        type: Number,               // 2 - Admin, 1 - user
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
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("internal", internalSchema);

