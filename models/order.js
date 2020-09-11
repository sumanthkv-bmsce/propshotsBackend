var mongoose = require("mongoose");

var orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    paymentSignature: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
