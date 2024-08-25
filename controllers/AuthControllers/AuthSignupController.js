import bcrypt from "bcrypt";
import { usercollections } from "../../schemas/UsersSchema.js";




export const AuthSignupController = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  try {
    const existingUser = await usercollections.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
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
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.log(err)
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors });
    }
  }
};
