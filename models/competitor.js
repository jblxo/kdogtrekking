var mongoose = require('mongoose');

var competitorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  dogName: String,
  dogRace: String,
  isRegistered: {
    type: Boolean,
    default: false
  },
  category: String,
  place: {
    type: Number,
    default: 0
  },
  time: {
    type: Date,
    default: new Date(0, 0, 0, 0, 0, 0, 0)
  }
});

module.exports = mongoose.model('Competitor', competitorSchema);
