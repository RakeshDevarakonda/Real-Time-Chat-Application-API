import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { usercollections } from './../../schemas/UsersSchema.js';

export const AuthSigninController = async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body)
  try {
    const user = await usercollections.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = Jwt.sign({ id: user._id }, process.env.secretkey, { expiresIn: "100h" });

    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS
    //   maxAge: 100 * 60 * 60 * 1000 // 100 hours
    // });


    res.status(200).json({ message: 'Sign-in successful',token });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
