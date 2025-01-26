function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    //jwt authentication error
    return res.status(500).json({ message: "The User is not authorized" });
  }
  if (err.name === "ValidationError") {
    //validation error
    return res.status(500).json({ message: err });
  }
  //default to 500 server Error
  return res.status(500).json({ message: err.message }); //general Error.
}

module.exports = { errorHandler };
