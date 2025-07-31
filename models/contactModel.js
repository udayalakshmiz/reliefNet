import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    subject:{
        type: String,
        required: true,
        trim: true,
    },
    message:{
        type: String,
        required: true,
        trim: true,
    },
    submittedAt:{
        type:  Date,
        default: Date.now,
    }
});

export default mongoose.model("contactmessages", contactSchema);
