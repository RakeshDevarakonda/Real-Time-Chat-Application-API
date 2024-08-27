import bcrypt from "bcrypt";
import { usercollections } from "../../schemas/UsersSchema.js";


export const AuthSignupController = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  try {
    const existingUser = await usercollections.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (!username || !email || !password || !confirmpassword) {
      return res.status(409).json({ message: "please enter all details username , email, password ,confirmpassword" });
    }



    if (username.trim().length <= 3 || username.trim().length <= 3) {
      return res
        .status(400)
        .json({
          message: "username Must be Atleast 4 Characters and non-empty spaces",
        });
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

  

    if (password.trim().length <= 3 || confirmpassword.trim().length <= 3) {
      return res
        .status(400)
        .json({
          message: "Password Must be Atleast 4 Characters and non-empty spaces",
        });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new usercollections({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "Registration successful", email, password });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors });
    }

    next(err);
  }
};
