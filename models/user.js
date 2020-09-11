var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    phone: {
      type: Number,
      // required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    browserName: {
      type: String,
      trim: true,
    },
    browserVersion: {
      type: String,
      trim: true,
    },
    browserOs: {
      type: String,
      trim: true,
    },
    IP: {
      type: String,
      trim: true,
    },
    IPV6: {
      type: String,
      trim: true,
    },
    lat: {
      type: String,
    },
    lon: {
      type: String,
    },
    shortlisted: {
      type: Array,
      default: [],
    },
    myProperty: {
      type: Array,
      default: [],
    },
    ignore: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
