/**
 * Service Layer
 */
const jwt = require("jsonwebtoken");

const SECRET = "somethingverysecret";


function createToken(payload) {
  return jwt.sign(payload, SECRET);
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    return { verified: true, payload: payload };
  } catch (err) {
    return { verified: false, payload: null };
  }
}

module.exports = { verifyToken, createToken };
