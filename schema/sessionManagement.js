let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//sessionManagement Schema
let sessionManagementSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        require: true,
        ref: "user",
        unique: true
    },
    jwt: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        expires: 86400, // TTL in seconds (1 day)
        default: Date.now,
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("sessionManagement", sessionManagementSchema);

