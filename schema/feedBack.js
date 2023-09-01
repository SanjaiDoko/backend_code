const { Mongoose, default: mongoose } = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const feedBackSchema = new mongoose.Schema({
    rating:{
        type:Number,
        required : true
    },
    suggestion:{
        type:String,
        require: true,
        trim:true
    },
    groupId:{
        type: ObjectId,
        require:true
    },
    createdById:{
        type: ObjectId,
        require:true
    }
})

module.exports = new mongoose.model("feedBack",feedBackSchema)