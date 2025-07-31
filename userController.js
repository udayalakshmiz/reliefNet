import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res)=>{
    try {
        const { name, email, phone, location, role, password} = req.body;
        const existing = await User.findOne({email});
        if(existing){
            return res.status(200).json({message : "Email already registered."});
        }
        const hashpassword = await bcrypt.hash(password, 8);
        const newUser = new User({name, email, phone, location, role, password: hashpassword});
        await newUser.save();
        res.status(200).json({message : "User registered successfully."});
    } catch (error) {
        res.status(400).json({error: "Internal Server error."});
    }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');
    res.status(200).json(volunteers);
  } catch (error) {
    console.error("Get Volunteers Error:", error);
    res.status(500).json({ error: 'Failed to get volunteers' });
  }
};
