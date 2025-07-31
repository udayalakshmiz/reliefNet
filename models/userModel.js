import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    phone:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['victim', 'volunteer', 'ngo'],
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("users", userSchema);
