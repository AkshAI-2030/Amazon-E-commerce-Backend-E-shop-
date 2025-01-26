const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

router.get(`/`, async (req, res) => {
  try {
    const OrderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });
    if (!OrderList) return res.status(500).json({ success: false });
    res.status(200).json({ OrderList });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured while fetching orderList" });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (!order) return res.status(500).json({ success: false });
    res.status(200).json({ order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured while fetching orderList by Id" });
  }
});

router.post("/", async (req, res) => {
  //created before the order.
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemIds;
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const calculatedTotalPrice = totalPrices.reduce((a, b) => a + b, 0);

  const {
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    user,
  } = req.body;
  try {
    let newOrder = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      status,
      totalPrice: calculatedTotalPrice,
      user,
    });
    newOrder = await newOrder.save();
    if (!newOrder)
      return res.status(400).json({ message: "New Order cant be created" });
    return res.status(200).json(newOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );
    if (!order)
      return res.status(400).json({ message: "The order can't be updated" });
    return res.status(200).json({ order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales)
    return res
      .status(400)
      .json({ message: "The order sales cannot be generated" });
  return res.status(200).json({ totalSales: totalSales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    if (!orderCount) return res.status(500).json({ success: false });
    res.status(200).json({ orderCount });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({
        dateOrdered: -1,
      });
    if (!userOrderList) return res.status(500).json({ success: false });
    res.status(200).json({ userOrderList });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured while fetching userOrderList" });
  }
});

module.exports = router;
