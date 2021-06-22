const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');

const MONGODB_URI = config.get('db.mongodb.uri');
mongoose.Promise = Promise;

if (process.env.NODE_ENV === 'production') {
    mongoose.connect(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    })
} else {
    mongoose.connect(
        MONGODB_URI,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        },
        (error) => {
            if (error) {
                console.log(error)
            } else {
                console.log('database connection established');
            }
        }
    )
}

module.exports = mongoose;
