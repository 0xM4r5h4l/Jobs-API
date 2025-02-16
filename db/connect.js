const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose.connect(url)
    // useNewUrlParser - useUnifiedTopology are deprecated since Node.js Driver 4.0.0
}

module.exports = connectDB