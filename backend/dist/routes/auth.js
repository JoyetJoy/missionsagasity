"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const otp_1 = require("../lib/otp");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, pastorId: user.pastor_id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        const { password_hash, ...safeUser } = user;
        res.json({ token, user: safeUser });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, address, pincode } = req.body;
        if (!name || !password || !phone || !pincode) {
            return res.status(400).json({ error: 'Name, password, phone, and pincode are required' });
        }
        const emailToUse = email || `${phone.replace(/\D/g, '')}@sagacity.local`;
        // Check existing
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: emailToUse }, select: { id: true } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email: emailToUse,
                password_hash: hashedPassword,
                role: 'user',
                phone,
                address: address || null,
                pincode,
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        const { password_hash, ...safeUser } = user;
        res.status(201).json({ token, user: safeUser });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pastor_id: true,
                avatar: true,
                phone: true,
                address: true,
                pincode: true,
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        if (!phoneNumber || !code) {
            const missing = !phoneNumber ? "phoneNumber" : "code";
            return res.status(400).json({
                status: false,
                error: `${missing} is required`,
            });
        }
        // Check if user already exists with this phone number (signup check)
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: { phone: phoneNumber }
        });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                error: "Phone number already exists",
            });
        }
        await (0, otp_1.sendOTPtoPhone)(phoneNumber, code);
        res.status(200).json({ status: true, message: "OTP sent successfully" });
    }
    catch (error) {
        console.error("send-otp error:", error.message);
        res.status(500).json({ status: false, error: error.message });
    }
});
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ status: false, error: "phoneNumber and otp are required" });
        }
        const isVerified = await (0, otp_1.verifyOTPinPhone)(phoneNumber, otp);
        if (!isVerified.valid) {
            return res.status(400).json({ error: isVerified.message });
        }
        res.status(200).json({ message: "OTP verified successfully", status: 200 });
    }
    catch (error) {
        console.error("verify-otp error:", error.message);
        res.status(500).json({ status: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map