const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const multer = require("multer");

const FILE_TYPE_MATH = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MATH[file.mimetype];
    let uploadError = new Error("Invalid Image Type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MATH[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  try {
    const productList = await Product.find(filter).populate("category");
    if (!productList) return res.status(500).json({ success: false });
    res.status(200).json({ productList });
  } catch (error) {
    return res.status(500).json({ message: "Error occured:" });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(500).json({ success: false });
    res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Error occured:" });
  }
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  console.log("File: ", req.file); // Log file details
  console.log("Body: ", req.body); // Log request body

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const {
    name,
    description,
    richDescription,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  } = req.body;
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  try {
    const existingCategory = await Category.findById(category);
    if (!existingCategory)
      return res.status(400).json({ message: "Invalid category" });
    const newProduct = new Product({
      name,
      description,
      richDescription,
      image: `${basePath}${fileName}`,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    });
    let savedProduct = await newProduct.save();
    if (!savedProduct)
      return res.status(500).json({ message: "The product can't be created" });
    return res.status(200).json({ savedProduct });
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product Id" });
  }
  const {
    name,
    description,
    richDescription,
    image,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  } = req.body;
  try {
    const existingCategory = await Category.findById(category);
    if (!existingCategory)
      return res.status(400).json({ message: "Invalid category" });
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        richDescription,
        image,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReviews,
        isFeatured,
      },
      {
        new: true,
      }
    );
    if (!product)
      return res.status(400).json({ message: "The product can't be updated" });
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) return res.status(500).json({ success: false });
    res.status(200).json({ productCount });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  if (!count) {
    return res.status(400).json({ message: "Count is required" });
  }
  try {
    const products = await Product.find({ isFeatured: true }).limit(+count);
    if (!products) return res.status(500).json({ success: false });
    res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while fetching featured products:",
      error: error.message,
    });
  }
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product Id" });
    }
    const files = req.files;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let imagePaths = [];
    if (files) {
      files.map((eachFile) => {
        imagePaths.push(`${basePath}${eachFile.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      {
        new: true,
      }
    );
    if (!product)
      return res.status(400).json({ message: "The product can't be updated" });
    return res.status(200).json({ product });
  }
);

module.exports = router;
