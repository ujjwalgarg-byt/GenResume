const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../models/blacklistSchema");

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isTokenBlacklisted = await tokenBlacklist.findOne({ token });
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: "Token is Invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

    req.user = decoded;
    next();
  }catch(err){
    console.error(err.message);
    
  }
}

module.exports = {authUser};