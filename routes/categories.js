const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Category } = require("../models/category");

router.get(`/`, async (req, res) => {
  try {
    const CategoryList = await Category.find();
    if (!CategoryList) return res.status(500).json({ success: false });
    res.status(200).json({ CategoryList });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(500)
        .json({ message: "The category with the givenn ID was not found." });
    }
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    let newCategory = new Category({
      name,
      icon,
      color,
    });
    newCategory = await newCategory.save();
    if (!newCategory)
      return res.status(400).json({ message: "Category cant be created" });
    return res.status(200).json(newCategory);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      {
        new: true,
      }
    );
    if (!category)
      return res.status(400).json({ message: "The category can't be updated" });
    return res.status(200).json({ category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The category is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
