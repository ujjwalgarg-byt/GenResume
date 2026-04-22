const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../models/blacklistSchema");
/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */

const registerUserController = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Please provide user details" });
    }
    const isAlreadyExists = await User.findOne({
      $or: [{ userName }, { email }],
    });
    if (isAlreadyExists) {
      return res
        .status(400)
        .json({
          message: "Account already exists with this email or username",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      userName,
      email,
      password: passwordHash,
    });
    const savedUser = await user.save();

    const token = await jwt.sign(
      { id: savedUser._id, userName: savedUser.userName },
      process.env.JWT_SECRETKEY,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 24 * 3600000),
    });

    res.status(201).json({
      message: "User added successfully!!",
      data: {
        id: savedUser._id,
        userName: savedUser.userName,
        email: savedUser.email,
      },
    });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};
/**
 * @name loginUsercntroller
 * @description login a user, expects email and password in the request body
 * @access Public
 *
 */

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordvalid = await bcrypt.compare(password, user.password);

    if (!isPasswordvalid) {
      throw new Error("Invalid credentials");
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.JWT_SECRETKEY,
      { expiresIn: "1d" },
    );

    // send cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1 * 24 * 3600000),
    });

    // send safe response
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};

/**
 * @name logoutUserController
 * @description logout a user by clearing token from cookie and add it into blacklist collection
 * @access Public
 */

const logoutUserController = async (req, res) => {
    try{
        const token = req.cookies.token;
        if(token){
            await tokenBlacklist.create({token});
        }
        res.clearCookie("token");
        res.json({message:"Logout successful"});
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
};

/**
 * @name getUserProfileController
 * @description get the current logged in user details
 * @access Public
 */
const getUserProfileController = async (req, res) => {
    try{
        const user = req.user;
        const userDetails = await User.findById(user.id);
        res.status(200).json({message:"User details fetched successfully",user:{
            id:userDetails._id,
            userName:userDetails.userName,
            email:userDetails.email,
          }})
    }catch(err){
      console.error(err);
    }
};


module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getUserProfileController
};
