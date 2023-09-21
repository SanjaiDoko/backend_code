let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

let eodSummary = mongoose.Schema({
    hours:{
        type: String,
        required: true
    },
    minutes:{
        type: String,
        default: "0"
    },
    taskDescription: {
        type: String,
        required: true
    }
})

//Eod Schema
let eodSchema = mongoose.Schema({
 
    groupId: {
        type: ObjectId,
        required: true,
        ref:"group"
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
    eodSummary: [eodSummary],
    systemInfo: {
        type: Object
    },
    ccMail: {
        type: Array
    },
    eodDate: {
       type: Date
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("eod", eodSchema);

