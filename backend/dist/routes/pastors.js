"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Helper to map Prisma result to the expected response shape
function mapPastor(p) {
    if (!p)
        return null;
    return {
        id: p.id,
        name: p.name,
        title: p.title,
        bio: p.bio,
        email: p.email,
        phone: p.phone,
        church: p.church,
        photo: p.photo,
        address: p.address,
        pincode: p.pincode,
        locationLink: p.location_link,
        specialties: p.specialties || [],
        yearsOfService: p.years_of_service,
        donationLink: p.donation_link,
        content: (p.pastor_content || []).map((c) => ({
            id: c.id,
            type: c.type,
            title: c.title,
            content: c.content,
            url: c.url,
            thumbnail: c.thumbnail,
            description: c.description,
            approvalStatus: c.approval_status,
            createdAt: c.created_at,
        })),
        books: (p.pastor_books || []).map((b) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            price: Number(b.price),
            coverImage: b.cover_image,
            pageCount: b.page_count,
            publishedDate: b.published_date,
            category: b.category,
            approvalStatus: b.approval_status,
            createdAt: b.created_at,
        })),
        createdAt: p.created_at,
    };
}
// GET /api/pastors - List all sages
router.get('/', async (_req, res) => {
    try {
        const pastors = await prisma_1.prisma.pastor.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                pastor_content: { orderBy: { created_at: 'desc' } },
                pastor_books: { orderBy: { created_at: 'desc' } },
            },
        });
        res.json(pastors.map(mapPastor));
    }
    catch (err) {
        console.error('List pastors error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/pastors/:id
router.get('/:id', async (req, res) => {
    try {
        const pastor = await prisma_1.prisma.pastor.findUnique({
            where: { id: req.params.id },
            include: {
                pastor_content: { orderBy: { created_at: 'desc' } },
                pastor_books: { orderBy: { created_at: 'desc' } },
            },
        });
        if (!pastor)
            return res.status(404).json({ error: 'Sage not found' });
        res.json(mapPastor(pastor));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/pastors/by-user/:userId
router.get('/by-user/:userId', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.userId },
            select: { pastor_id: true },
        });
        if (!user || !user.pastor_id) {
            return res.status(404).json({ error: 'Sage profile not found for this user' });
        }
        const pastor = await prisma_1.prisma.pastor.findUnique({
            where: { id: user.pastor_id },
            include: {
                pastor_content: { orderBy: { created_at: 'desc' } },
                pastor_books: { orderBy: { created_at: 'desc' } },
            },
        });
        res.json(mapPastor(pastor));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors - Admin create sage
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { name, title, bio, email, phone, church, photo, address, pincode, locationLink, specialties, yearsOfService, donationLink, password } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const newPastor = await prisma_1.prisma.$transaction(async (tx) => {
            const pastor = await tx.pastor.create({
                data: {
                    name, title, bio, email, phone, church, photo, address, pincode,
                    location_link: locationLink, specialties: specialties || [],
                    years_of_service: yearsOfService || 0, donation_link: donationLink,
                },
            });
            const loginPassword = password || 'sagacity123';
            const hashedPassword = await bcryptjs_1.default.hash(loginPassword, 10);
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                await tx.user.update({
                    where: { email },
                    data: {
                        role: 'pastor',
                        pastor_id: pastor.id,
                        phone: phone || existingUser.phone,
                        address: address || existingUser.address,
                        pincode: pincode || existingUser.pincode,
                        avatar: photo || existingUser.avatar,
                    },
                });
            }
            else {
                await tx.user.create({
                    data: {
                        name, email, password_hash: hashedPassword, role: 'pastor',
                        pastor_id: pastor.id, avatar: photo, phone, address, pincode,
                    },
                });
            }
            return pastor;
        });
        const fullPastor = await prisma_1.prisma.pastor.findUnique({
            where: { id: newPastor.id },
            include: { pastor_content: true, pastor_books: true },
        });
        res.status(201).json(mapPastor(fullPastor));
    }
    catch (err) {
        console.error('Create pastor error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/pastors/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.pastorId !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { name, title, bio, email, phone, church, photo, address, pincode, locationLink, specialties, yearsOfService, donationLink } = req.body;
        const updateData = { updated_at: new Date() };
        if (name !== undefined)
            updateData.name = name;
        if (title !== undefined)
            updateData.title = title;
        if (bio !== undefined)
            updateData.bio = bio;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (church !== undefined)
            updateData.church = church;
        if (photo !== undefined)
            updateData.photo = photo;
        if (address !== undefined)
            updateData.address = address;
        if (pincode !== undefined)
            updateData.pincode = pincode;
        if (locationLink !== undefined)
            updateData.location_link = locationLink;
        if (specialties !== undefined)
            updateData.specialties = specialties;
        if (yearsOfService !== undefined)
            updateData.years_of_service = yearsOfService;
        if (donationLink !== undefined)
            updateData.donation_link = donationLink;
        const pastor = await prisma_1.prisma.pastor.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                pastor_content: { orderBy: { created_at: 'desc' } },
                pastor_books: { orderBy: { created_at: 'desc' } },
            },
        });
        res.json(mapPastor(pastor));
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Sage not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/pastors/:id
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        await prisma_1.prisma.pastor.delete({ where: { id: req.params.id } });
        res.json({ message: 'Sage deleted' });
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Sage not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:id/content
router.post('/:id/content', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.pastorId !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { type, title, content, url, thumbnail, description } = req.body;
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const newContent = await prisma_1.prisma.pastorContent.create({
            data: {
                pastor_id: req.params.id,
                type, title, content, url, thumbnail, description,
                approval_status: status,
            },
        });
        res.status(201).json(newContent);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:pastorId/content/:contentId/approve
router.post('/:pastorId/content/:contentId/approve', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await prisma_1.prisma.pastorContent.update({
            where: { id: req.params.contentId, pastor_id: req.params.pastorId },
            data: { approval_status: 'approved' },
        });
        res.json(updated);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Content not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:pastorId/content/:contentId/reject
router.post('/:pastorId/content/:contentId/reject', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await prisma_1.prisma.pastorContent.update({
            where: { id: req.params.contentId, pastor_id: req.params.pastorId },
            data: { approval_status: 'rejected' },
        });
        res.json(updated);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Content not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:id/books
router.post('/:id/books', auth_1.authenticate, (req, res, next) => {
    upload_1.upload.single('coverImage')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.pastorId !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { title, description, price, pageCount, publishedDate, category } = req.body;
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        // File check from multer
        const coverImageUrl = req.file ? req.file.location : req.body.coverImage;
        const newBook = await prisma_1.prisma.pastorBook.create({
            data: {
                pastor_id: req.params.id, title, description,
                price: price ? Number(price) : 0,
                cover_image: coverImageUrl,
                page_count: pageCount ? Number(pageCount) : null,
                published_date: publishedDate ? new Date(publishedDate) : null,
                category,
                approval_status: status,
            },
        });
        res.status(201).json(newBook);
    }
    catch (err) {
        console.error('Create pastor book error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:pastorId/books/:bookId/approve
router.post('/:pastorId/books/:bookId/approve', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await prisma_1.prisma.pastorBook.update({
            where: { id: req.params.bookId, pastor_id: req.params.pastorId },
            data: { approval_status: 'approved' },
        });
        res.json(updated);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Book not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/pastors/:pastorId/books/:bookId/reject
router.post('/:pastorId/books/:bookId/reject', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const updated = await prisma_1.prisma.pastorBook.update({
            where: { id: req.params.bookId, pastor_id: req.params.pastorId },
            data: { approval_status: 'rejected' },
        });
        res.json(updated);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Book not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/pastors/admin/pending
router.get('/admin/pending', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (_req, res) => {
    try {
        const content = await prisma_1.prisma.pastorContent.findMany({
            where: { approval_status: 'pending' },
            include: { pastor: { select: { name: true } } },
            orderBy: { created_at: 'desc' },
        });
        const books = await prisma_1.prisma.pastorBook.findMany({
            where: { approval_status: 'pending' },
            include: { pastor: { select: { name: true } } },
            orderBy: { created_at: 'desc' },
        });
        res.json({
            pendingContent: content.map((c) => ({ ...c, pastor_name: c.pastor?.name })),
            pendingBooks: books.map((b) => ({ ...b, pastor_name: b.pastor?.name })),
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=pastors.js.map