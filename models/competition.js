var mongoose = require('mongoose');

var competitionSchema = new mongoose.Schema({
  title: String,
  location: String,
  map: String,
  description: String,
  competitors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competitor'
    }
  ],
  categories: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Competition', competitionSchema);
