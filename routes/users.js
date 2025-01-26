const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  try {
    const UserList = await User.find().select("-passwordHash");
    if (!UserList) return res.status(500).json({ success: false });
    res.status(200).json({ UserList });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while fetching users", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res
        .status(500)
        .json({ message: "The user with the givenn ID was not found." });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    } = req.body;
    let newUser = new User({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    });
    newUser = await newUser.save();
    if (!newUser)
      return res.status(400).json({ message: "newUser can't be created" });
    return res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while creating users:",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      const secret = process.env.secret;
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        {
          expiresIn: "1d",
        }
      );
      return res.status(200).json({ user: user.email, token: token });
    } else {
      return res.status(400).json({ message: "Password is Invalid" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while login", error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    } = req.body;
    let newUser = new User({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    });
    newUser = await newUser.save();
    if (!newUser)
      return res.status(400).json({ message: "NewUser can't be registered" });
    return res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while registering:",
      error: error.message,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) return res.status(500).json({ success: false });
    res.status(200).json({ userCount });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured:", error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
