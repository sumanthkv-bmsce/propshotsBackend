const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const propertySchema = new mongoose.Schema(
  {
    PropertyFor: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    PropertyType: {
      type: String,
      trim: true,
      required: true,
    },
    subType: {
      type: String,
      trim: true,
      required: true,
    },
    exactType: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    plotArea: {
      type: Number,
      trim: true,
      required: true,
    },
    plotUnit: {
      type: String,
      trim: true,
      required: true,
    },
    possession: {
      type: String,
      trim: true,
      required: true,
    },
    marketValue: {
      type: String,
      trim: true,
      required: true,
    },
    discountPer: {
      type: Number,
      required: true,
    },

    photo: {
      data: Buffer,
      contentType: String,
    },
    photo1: {
      data: Buffer,
      contentType: String,
    },
    photo2: {
      data: Buffer,
      contentType: String,
    },
    photo3: {
      data: Buffer,
      contentType: String,
    },
    photo4: {
      data: Buffer,
      contentType: String,
    },

    userid: {
      type: String,
    },
    username: {
      type: String,
    },
    userphone: {
      type: Number,
    },
    uniqueId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    lat: {
      type: String,
    },
    lng: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    states: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    allimglen: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
