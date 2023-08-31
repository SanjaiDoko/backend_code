let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//User Schema
let userSchema = mongoose.Schema({
 
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
        type: Date
    },
    actualEndTime: {
        type: Date
    },
    timeLog: {
        type: String
    },
    status: {               // 1 - active, 2 - deactive, 0 - delete
        type: Number,
        default: 0
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("ticket", userSchema);

