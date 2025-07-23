import express from "express";
import { AuthSignupController } from './../controllers/AuthControllers/AuthSignupController.js';
import { AuthSigninController } from './../controllers/AuthControllers/AuthSigninController.js';

const AuthRouter=express.Router()


AuthRouter.post("/register",AuthSignupController)
AuthRouter.post("/login",AuthSigninController)


export default AuthRouter;