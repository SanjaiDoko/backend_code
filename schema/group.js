let mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId
//Group Schema
let groupSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    managedBy: {
        type: ObjectId,
        require: true,
    },
    users: {
        type: Array,
        default: []
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("group", groupSchema);

