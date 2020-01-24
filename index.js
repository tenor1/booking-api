var express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DAYS_COUNT = 365;
const ROOM_LIST = [1, 2];

const BookingSchema = require('./src/models/bookingModel');
const bookingModel = mongoose.model('booking', BookingSchema);

let createBooking = (req, res) => {
    let booking = new bookingModel(req.body);
    booking.save((err, body) => {
        if(err) {
            res.send(err);
        }
        res.json(body);
    });
};

let getAllBookings = (req, res) => {
    bookingModel.find({}, (err, bookings) => {
        if(err) {
            res.send(err);
        }
        res.json(bookings);
    })
}

let getBookingById = (req, res) => {
    bookingModel.findById(req.params.bookingId, (err, booking) => {
        if(err) {
            res.send(err);
        }
        res.json(booking);
    })
}

let updateBooking = (req, res) => {
    bookingModel.findByIdAndUpdate({_id: req.params.bookingId}, req.body, {new: true}, (err, updatedBooking) => {
        if(err) {
            res.send(err);
        }
        res.json(updatedBooking);
    })
}

let getFreeDates = (req, res) => {
    bookingModel.find({}, (err, bookings) => {
        if(err) {
            res.send(err);
        }

        const {current_page, per_page} = req.query;
        const days = [];
        bookings.forEach((booking) => {
            for(let i=booking.from; i <= booking.to; i++) {
                if (!days[i]) {
                    days[i] = {};
                    days[i].freeRooms = [...ROOM_LIST];
                    days[i].busyRooms = [booking.room];
                } else {
                    days[i].busyRooms.push(booking.room);
                }
                const busyIndex = days[i].freeRooms.findIndex((value) => {
                    return value === booking.room;
                })
                days[i].freeRooms.splice(busyIndex, 1);
            }
        });
        let freeDays = [];
        let busyDays = [];
        for (let index=1; index<DAYS_COUNT; index++) {
            day = days[index];
            if (day && day.busyRooms && day.busyRooms.length >= ROOM_LIST.length) {
                busyDays.push(index);
            } else if (day) {
                freeDays.push({day: index, freeRooms: day.freeRooms});
            } else {
                freeDays.push({day: index, freeRooms: ROOM_LIST});
            }
        }
        const page_count = Math.ceil(freeDays.length / per_page);
        const startIndex = per_page * (current_page - 1);
        const endIndex = startIndex + Number(per_page);
        const paginatedFreeDays = freeDays.slice(startIndex, endIndex);

        res.json({paginatedFreeDays, busyDays, page_count});
    });
};

let deleteBooking = (req, res) => {
    bookingModel.deleteOne({_id: req.params.bookingId}, (err, booking) => {
        if(err) {
            res.send(err);
        }
        res.json({message: 'Booking order deleted successfully'})
    })
}

app.get('/booking/free', getFreeDates);
app.get('/booking', getAllBookings);
app.get('/booking/:bookingId', getBookingById);
app.put('/booking/:bookingId', updateBooking);
app.post('/booking', createBooking)
app.delete('/booking/:bookingId', deleteBooking);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
