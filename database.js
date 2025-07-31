import dotenv from 'dotenv';
dotenv.config();

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);


import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ MONGODB_URI is undefined. Check your .env file!");
    process.exit(1);
}

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully!'))
.catch((err) => console.error('❌ MongoDB connection failed:', err));

