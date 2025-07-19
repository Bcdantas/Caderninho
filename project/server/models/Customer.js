const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  hasDebt: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Customer', customerSchema);