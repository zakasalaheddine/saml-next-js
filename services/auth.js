/**
 * Service Layer
 */
const jwt = require("jsonwebtoken");

const SECRET = "somethingverysecret";

// this is a mock function, it should be used to interact with your database in real use case
function getUser(login) {
  if (login === "user.passify.io@gmail.com") {
    return {
      user_id: "21b06b08-f296-42f4-81aa-73fb5a8eac67",
      email: login,
    };
  }
  return null;
}

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

module.exports = { verifyToken, createToken, getUser };
