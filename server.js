const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// رابط قاعدة البيانات
const MONGO_URI = "mongodb+srv://alhumaidi:Alhumaidi%402026@cluster0.kambo2i.mongodb.net/?appName=Cluster0";

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// نموذج المستخدم
const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    balance: { type: Number, default: 0 },
    ownerBalance: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// مسار رئيسي
app.get('/', (req, res) => {
    res.json({
        status: "Online",
        app: "Al-Humaidi Media for Profit",
        message: "Server is running 24/7 successfully!",
        database: "MongoDB Atlas Connected"
    });
});

// مسار تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
    try {
        const { phone, pin, referredBy } = req.body;

        if (!phone || !pin) {
            return res.status(400).json({ error: "Phone and PIN are required" });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const referralCode = phone + Math.floor(1000 + Math.random() * 9000);

        const newUser = new User({
            phone,
            pin,
            referralCode,
            referredBy: referredBy || null
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                phone: newUser.phone,
                balance: newUser.balance,
                referralCode: newUser.referralCode,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسار تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { phone, pin } = req.body;

        if (!phone || !pin) {
            return res.status(400).json({ error: "Phone and PIN are required" });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.pin !== pin) {
            return res.status(401).json({ error: "Invalid PIN" });
        }

        res.json({
            message: "Login successful",
            user: {
                phone: user.phone,
                balance: user.balance,
                ownerBalance: user.ownerBalance,
                totalWithdrawn: user.totalWithdrawn,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسار حساب وتوزيع الأرباح (40% للمالك و 60% للمستخدم)
app.post('/api/calculate-reward', async (req, res) => {
    try {
        const { phone, totalAmount } = req.body;

        if (!phone || !totalAmount || isNaN(totalAmount)) {
            return res.status(400).json({ error: "Phone and valid totalAmount are required" });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const ownerShare = totalAmount * 0.40;
        const userShare = totalAmount * 0.60;

        user.balance += userShare;
        user.ownerBalance += ownerBalance;
        await user.save();

        res.json({
            total: totalAmount,
            ownerShare: ownerShare,
            userShare: userShare,
            userBalance: user.balance,
            ownerBalance: user.ownerBalance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسار جلب بيانات المستخدم
app.get('/api/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            phone: user.phone,
            balance: user.balance,
            ownerBalance: user.ownerBalance,
            totalWithdrawn: user.totalWithdrawn,
            referralCode: user.referralCode,
            referredBy: user.referredBy,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسار احتياطي
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
