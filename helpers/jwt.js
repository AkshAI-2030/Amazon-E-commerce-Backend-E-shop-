const { expressjwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked, //async function for checking the Roles
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, jwt) {
  //console.log("Payload:", jwt.payload); // Log the JWT payload
  if (!jwt.payload.isAdmin) {
    console.log("Access revoked for non-admin user");
    return true; // Access is revoked
  }
  console.log("Access granted for admin user");
  return false; // Access is granted
}

module.exports = { authJwt };
