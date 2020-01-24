var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
    room: Number,
    from: Number,
    to: Number
})

module.exports = bookingSchema;