const mongoose = require('mongoose');
const UserSessionSchema = new mongoose.Schema({
   user: String,
   isDeleted: {
       type: Boolean,
       default: false
   }, 
   createdt:{
    type:Date,
    default: Date.now
}
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
