const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

orderItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderItemSchema.set("toJSON", {
  virtuals: true,
});
const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = { OrderItem };
