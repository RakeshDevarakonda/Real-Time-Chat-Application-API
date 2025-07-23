import bcrypt from "bcrypt";
import { usercollections } from "../../schemas/UsersSchema.js";
import { redisClient } from "../../redis-config.js";

export const AuthSignupController = async (req, res, next) => {
  const { username, email, password, confirmpassword } = req.body;

  try {
    // Input validation
    if (!username || !email || !password || !confirmpassword) {
      return res
        .status(409)
        .json({
          message:
            "Please enter all details: username, email, password, confirmpassword",
        });
    }
    if (username.trim().length <= 3) {
      return res
        .status(400)
        .json({
          message:
            "Username must be at least 4 characters and non-empty spaces",
        });
    }
    if (email.trim().length <= 3) {
      return res
        .status(400)
        .json({
          message: "Email must be at least 4 characters and non-empty spaces",
        });
    }
    if (password.trim().length <= 3 || confirmpassword.trim().length <= 3) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 4 characters and non-empty spaces",
        });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const redisUserKey = `user:email:${email}`;
    let existingUser = null;
    const cachedUser = await redisClient.get(redisUserKey);
    if (cachedUser) {
      existingUser = JSON.parse(cachedUser);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
    } else {
      
      const safeEmail = email.trim().toLowerCase();

      existingUser = await usercollections.findOne({ email: safeEmail });

      if (existingUser) {
        await redisClient.set(
          redisUserKey,
          JSON.stringify(existingUser),
          "EX",
          3600
        );
        await redisClient.set(
          `user:id:${existingUser._id}`,
          JSON.stringify(existingUser),
          "EX",
          3600
        );
        return res.status(409).json({ message: "User already exists" });
      }
    }

    // Create and save new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new usercollections({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    // Cache the new user by email and ID
    await redisClient.set(redisUserKey, JSON.stringify(newUser), "EX", 3600);
    await redisClient.set(
      `user:id:${newUser._id}`,
      JSON.stringify(newUser),
      "EX",
      3600
    );

    res.status(201).json({ message: "Registration successful", email });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors });
    }
    next(err);
  }
};
