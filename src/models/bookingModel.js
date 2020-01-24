var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
    room: Number,  // room number
    from: Number,  // start booking date
    to: Number     // end booking date
})

module.exports = bookingSchema;