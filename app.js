const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { authJwt } = require("./helpers/jwt");
const { errorHandler } = require("./helpers/error-handler");
require("dotenv").config();

app.use(cors());
app.options("*", cors());

//middlewares
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads")); //acts like static path.
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Datbase connnected successfully");
  })
  .catch((err) => {
    console.log("Error while connecting to the database.");
  });

//server
app.listen(3000, () => {
  console.log(`server started at port:${3000}`);
});
