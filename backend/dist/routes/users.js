"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/users - Admin only
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true, name: true, email: true, role: true, pastor_id: true,
                avatar: true, phone: true, address: true, pincode: true, created_at: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    }
    catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/users/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, name: true, email: true, role: true, pastor_id: true,
                avatar: true, phone: true, address: true, pincode: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/users - Admin create user
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role: 'user',
            },
            select: { id: true, name: true, email: true, role: true, created_at: true }
        });
        res.status(201).json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/users/:id - Admin update user
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { name, email } = req.body;
        const updateData = { updated_at: new Date() };
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(user);
    }
    catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/users/:id - Admin delete user
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        await prisma_1.prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map