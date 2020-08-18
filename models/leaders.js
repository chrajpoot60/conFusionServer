const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

var leaderSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },   
    featured: {
        type: Boolean,
        default:false      
    }
}, {
    timestamps: true
});
// "leader" name model/Schema/Document Created inside Database name "confusion"
var Leaders = mongoose.model('leader', leaderSchema);

module.exports = Leaders;