const express  = require("express");

const authRouter = express.Router();
const controller = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

/**
 * @route POST  /api/auth/register
 * @description register a new user
 * @access public
 */
authRouter.post("/register",controller.registerUserController)

/**
 * @route POST  /api/auth/login
 * @description login a user
 * @access public
 */
authRouter.post("/login",controller.loginUserController)
 
/**
 * @route GET  /api/auth/logout
 * @description logout a user by blacklisting the token
 * @access public
 */
authRouter.get("/logout",controller.logoutUserController)
 
/**
 * @route Get /api/auth/profile
 * @description get user profile, expects token in cookie
 * @access private
 */
authRouter.get("/profile",authMiddleware.authUser,controller.getUserProfileController);
 

module.exports = authRouter;

