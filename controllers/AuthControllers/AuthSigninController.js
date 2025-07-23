import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { usercollections } from "./../../schemas/UsersSchema.js";
import { redisClient } from "../../redis-config.js";

export const AuthSigninController = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(409)
        .json({ message: "Please enter all details: email, password" });
    }
    if (email.trim().length <= 3) {
      return res.status(400).json({
        message: "Email must be at least 4 characters and non-empty spaces",
      });
    }
    if (password.trim().length <= 3) {
      return res.status(400).json({
        message: "Password must be at least 4 characters and non-empty spaces",
      });
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const redisUserKey = `user:email:${email}`;

    let user = null;
    const cachedUser = await redisClient.get(redisUserKey);
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      const safeEmail = email.trim().toLowerCase();

      user = await usercollections.findOne({ email: safeEmail });
      if (user) {
        await redisClient.set(redisUserKey, JSON.stringify(user), "EX", 3600);
        await redisClient.set(
          `user:id:${user._id}`,
          JSON.stringify(user),
          "EX",
          3600
        );
      }
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = Jwt.sign({ id: user._id }, process.env.secretkey, {
      expiresIn: "100h",
    });

    res.status(200).json({ message: "Sign-in successful", token });
  } catch (error) {
    console.error("Sign-in error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors });
    }
    next(error);
  }
};
