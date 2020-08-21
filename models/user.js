var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
//here removed the username and password field because they already comes with 'passport-local-mongoose' plugin
var userSchema = new Schema ({
    admin: {
        type: Boolean,
        default: false
    } 
});
//using 'passport-local-mongoose' inside userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);