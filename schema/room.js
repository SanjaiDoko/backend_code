const mongoose = require('mongoose')

let ObjectId = mongoose.Schema.Types.ObjectId

const roomSchema = mongoose.Schema({
    roomName:{
        type:String
    },
    roomNo:{
        type:Number,
    },
    status:{
        type:Boolean,
        default:0
    },
    currentMeeting:{
        bookedBy:{type:ObjectId},
        reason:{type:String}
    },
    preBookings:{
        type:Number,
        default:0
    },
    activeStatus:{
        type:Boolean,
        default:1
    }
},{
    timestamps:true,
    versionKey:false
})

module.exports = mongoose.model('rooms',roomSchema)





// schedules:{
//         date:{type:[Date]},
//         time:{
//             start:{
//                 type:[String]
//             },
//             end:{
//                 type:[String]
//             }
//         },
//         bookedBy:{
//             type:[ObjectId]
//         },
// },