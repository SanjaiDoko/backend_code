let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//User Schema
let userSchema = mongoose.Schema({
    ticketId: {
       type: String,
       unique: true,
        require: true,
        trim: true
    },
    issueName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    issueDescription: {
        type: String,
        required: true
    },
    issueGroup: {
        type: ObjectId,
        required: true,
    },
    createdBy: {
        type: ObjectId,
        require: true,
        ref: "user"
    },
    managedBy: {
        type: ObjectId,
        require: true,
        ref: "user"
    },
    assignedTo: {
        type: ObjectId,
        default:null,
        ref: "user"
    },
    systemInfo: {
        type: Object
    },
    mailList: {
        type: Array
    },
    startTime: {
       type: Date
    },
    endTime: {
        type: Date,
        default: null
    },
    actualEndTime: {
        type: Date,
        default: null
    },
    timeLog: {
        type: String
    },
    files:{
        type:Array
    },
    assignedMail: {
        type: Number,
        default: 0
    },
    problem: {
       type: String
    },
    resolution: {
       type: String
    },
    status: {               // 0 - not assigned, 1 - completed, 2 - progress, 3 - rejected
        type: Number,
        default: 0
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("ticket", userSchema);

