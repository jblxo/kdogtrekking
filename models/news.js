var mongoose = require("mongoose");

var newsSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("News", newsSchema);