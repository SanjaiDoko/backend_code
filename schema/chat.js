let mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const chatSchema = mongoose.Schema({
    ticketId:{
        type:ObjectId,
        required : true
    },
    messageFrom:{
        type:ObjectId,
        require: true,
    },
    content:{
        type: String,
        require:true
    },
    
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model("chat",chatSchema)