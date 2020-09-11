var mongoose = require("mongoose");

var counterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Counter", counterSchema);
