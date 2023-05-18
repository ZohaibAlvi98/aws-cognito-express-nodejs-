const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
   userId: {
        type: String,
        unique: true
   },
   gender: {
       type: String,
       enum : ['male','female'],
       default: 'female'
   }, 
   name: String,
   createdt:{
    type:Date,
    default: Date.now
}
});

module.exports = mongoose.model('Coach', CoachSchema);
