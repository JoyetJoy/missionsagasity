"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/prayers - User's gatherings
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const prayers = await prisma_1.prisma.prayer.findMany({
            where: { user_id: req.user.id },
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
        });
        res.json(prayers.map(formatPrayer));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/prayers/all - All gatherings (admin)
router.get('/all', auth_1.authenticate, async (req, res) => {
    try {
        const prayers = await prisma_1.prisma.prayer.findMany({
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
        });
        res.json(prayers.map(formatPrayer));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/prayers/date/:date
router.get('/date/:date', auth_1.authenticate, async (req, res) => {
    try {
        const searchDate = new Date(req.params.date);
        const prayers = await prisma_1.prisma.prayer.findMany({
            where: { user_id: req.user.id, date: searchDate },
            orderBy: { time: 'asc' },
        });
        res.json(prayers.map(formatPrayer));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/prayers/upcoming
router.get('/upcoming', auth_1.authenticate, async (req, res) => {
    try {
        const result = await prisma_1.prisma.$queryRaw `
      SELECT * FROM prayers
      WHERE (date > CURRENT_DATE OR (date = CURRENT_DATE AND time > CURRENT_TIME))
      ORDER BY date ASC, time ASC
      LIMIT 10
    `;
        res.json(result.map(formatPrayer));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/prayers
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { title, description, date, time, endTime, category, isRecurring, recurringPattern, imageUrl, meetLink, groupId } = req.body;
        if (!title || !date || !time) {
            return res.status(400).json({ error: 'Title, date, and time are required' });
        }
        // append seconds if sending `14:30` format to let Date parse property (not actually required but safe)
        let timeStr = time.length === 5 ? `${time}:00` : time;
        const timeDate = new Date(`1970-01-01T${timeStr}Z`);
        let endTimeDate = null;
        if (endTime) {
            let endTimeStr = endTime.length === 5 ? `${endTime}:00` : endTime;
            endTimeDate = new Date(`1970-01-01T${endTimeStr}Z`);
        }
        const prayer = await prisma_1.prisma.prayer.create({
            data: {
                user_id: req.user.id,
                title,
                description,
                date: new Date(date),
                time: timeDate,
                end_time: endTimeDate,
                category: category || 'personal',
                is_recurring: isRecurring || false,
                recurring_pattern: isRecurring ? (recurringPattern || 'daily') : null,
                image_url: imageUrl,
                meet_link: meetLink,
                group_id: groupId,
            }
        });
        res.status(201).json(formatPrayer(prayer));
    }
    catch (err) {
        console.error('Create prayer error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/prayers/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { title, description, date, time, endTime, category, isRecurring, recurringPattern, imageUrl, meetLink, groupId } = req.body;
        const existing = await prisma_1.prisma.prayer.findUnique({ where: { id: req.params.id } });
        if (!existing)
            return res.status(404).json({ error: 'Gathering not found' });
        if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (date !== undefined)
            updateData.date = new Date(date);
        if (time !== undefined) {
            let timeStr = time.length === 5 ? `${time}:00` : time;
            updateData.time = new Date(`1970-01-01T${timeStr}Z`);
        }
        if (endTime !== undefined) {
            if (endTime) {
                let endTimeStr = endTime.length === 5 ? `${endTime}:00` : endTime;
                updateData.end_time = new Date(`1970-01-01T${endTimeStr}Z`);
            }
            else {
                updateData.end_time = null;
            }
        }
        if (category !== undefined)
            updateData.category = category;
        if (isRecurring !== undefined)
            updateData.is_recurring = isRecurring;
        if (isRecurring !== undefined)
            updateData.recurring_pattern = isRecurring ? recurringPattern : null;
        if (imageUrl !== undefined)
            updateData.image_url = imageUrl;
        if (meetLink !== undefined)
            updateData.meet_link = meetLink;
        if (groupId !== undefined)
            updateData.group_id = groupId;
        const updated = await prisma_1.prisma.prayer.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(formatPrayer(updated));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/prayers/:id
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const existing = await prisma_1.prisma.prayer.findUnique({ where: { id: req.params.id } });
        if (!existing)
            return res.status(404).json({ error: 'Gathering not found' });
        if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await prisma_1.prisma.prayer.delete({ where: { id: req.params.id } });
        res.json({ message: 'Gathering deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
function formatPrayer(row) {
    const extractTime = (d) => {
        if (!d)
            return undefined;
        // if raw SQL
        if (typeof d === 'string')
            return d.substring(0, 5);
        // if Prisma Date object for Time
        if (d instanceof Date)
            return d.toISOString().substring(11, 16);
        return d;
    };
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        date: row.date ? (row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date) : undefined,
        time: extractTime(row.time),
        endTime: extractTime(row.end_time),
        category: row.category,
        isRecurring: row.is_recurring,
        recurringPattern: row.recurring_pattern,
        imageUrl: row.image_url,
        meetLink: row.meet_link,
        groupId: row.group_id,
        postId: row.post_id,
        createdAt: row.created_at,
    };
}
exports.default = router;
//# sourceMappingURL=prayers.js.map