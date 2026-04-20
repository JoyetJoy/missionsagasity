"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Helper to format Prisma group to expected response format
function formatGroup(g) {
    return {
        ...g,
        member_count: g._count?.members ?? g.members?.length ?? 0,
        members: (g.members || []).map((m) => m.user_id),
        join_requests: (g.join_requests || []).map((jr) => jr.user_id),
        content_managers: (g.content_managers || []).map((cm) => cm.user_id),
    };
}
const groupIncludes = {
    members: { select: { user_id: true } },
    join_requests: { select: { user_id: true } },
    content_managers: { select: { user_id: true } },
    _count: { select: { members: true } }
};
// GET /api/groups - List approved groups (public), all for admin
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const whereClause = req.user?.role === 'admin' ? {} : { status: 'approved' };
        const groups = await prisma_1.prisma.group.findMany({
            where: whereClause,
            include: groupIncludes,
            orderBy: { created_at: 'desc' }
        });
        res.json(groups.map(formatGroup));
    }
    catch (err) {
        console.error('List groups error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/groups/:id
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const group = await prisma_1.prisma.group.findUnique({
            where: { id: req.params.id },
            include: groupIncludes
        });
        if (!group)
            return res.status(404).json({ error: 'Group not found' });
        res.json(formatGroup(group));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups - Create a flock
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, subtitle, description, type, avatar } = req.body;
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        const newGroup = await prisma_1.prisma.$transaction(async (tx) => {
            const g = await tx.group.create({
                data: {
                    name,
                    subtitle: subtitle || null,
                    description,
                    type: type || 'public',
                    status: 'pending',
                    created_by: req.user.id,
                    avatar: avatar || null,
                }
            });
            await tx.groupMember.create({ data: { group_id: g.id, user_id: req.user.id } });
            await tx.groupContentManager.create({ data: { group_id: g.id, user_id: req.user.id } });
            return g;
        });
        res.status(201).json({ ...newGroup, members: [req.user.id], content_managers: [req.user.id], join_requests: [] });
    }
    catch (err) {
        console.error('Create group error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/groups/:id - Update group
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { name, subtitle, description, type, avatar } = req.body;
        const existing = await prisma_1.prisma.group.findUnique({ where: { id: req.params.id } });
        if (!existing)
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        if (existing.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Group not found or unauthorized' });
        }
        const updateData = { updated_at: new Date() };
        if (name !== undefined)
            updateData.name = name;
        if (subtitle !== undefined)
            updateData.subtitle = subtitle;
        if (description !== undefined)
            updateData.description = description;
        if (type !== undefined)
            updateData.type = type;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        const group = await prisma_1.prisma.group.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/approve - Admin approve group
router.post('/:id/approve', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const group = await prisma_1.prisma.group.update({
            where: { id: req.params.id },
            data: { status: 'approved', updated_at: new Date() }
        });
        res.json(group);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Group not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/reject - Admin reject group
router.post('/:id/reject', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const group = await prisma_1.prisma.group.update({
            where: { id: req.params.id },
            data: { status: 'rejected', updated_at: new Date() }
        });
        res.json(group);
    }
    catch (err) {
        if (err.code === 'P2025')
            return res.status(404).json({ error: 'Group not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/join - Join a public group
router.post('/:id/join', auth_1.authenticate, async (req, res) => {
    try {
        const group = await prisma_1.prisma.group.findUnique({ where: { id: req.params.id } });
        if (!group)
            return res.status(404).json({ error: 'Group not found' });
        if (group.type === 'private') {
            return res.status(400).json({ error: 'Use request-join for private groups' });
        }
        try {
            await prisma_1.prisma.groupMember.create({
                data: { group_id: req.params.id, user_id: req.user.id }
            });
        }
        catch {
            // Ignore duplicate unique constraints (already joined)
        }
        res.json({ message: 'Joined group' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/leave
router.post('/:id/leave', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.groupMember.deleteMany({
            where: { group_id: req.params.id, user_id: req.user.id }
        });
        await prisma_1.prisma.groupContentManager.deleteMany({
            where: { group_id: req.params.id, user_id: req.user.id }
        });
        res.json({ message: 'Left group' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/request-join
router.post('/:id/request-join', auth_1.authenticate, async (req, res) => {
    try {
        try {
            await prisma_1.prisma.groupJoinRequest.create({
                data: { group_id: req.params.id, user_id: req.user.id }
            });
        }
        catch {
            // Ignore if exists
        }
        res.json({ message: 'Join request sent' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/approve-join/:userId
router.post('/:id/approve-join/:userId', auth_1.authenticate, async (req, res) => {
    try {
        const group = await prisma_1.prisma.group.findUnique({ where: { id: req.params.id } });
        if (!group)
            return res.status(404).json({ error: 'Group not found' });
        if (group.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only flock creator or admin can approve' });
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.groupJoinRequest.deleteMany({
                where: { group_id: req.params.id, user_id: req.params.userId }
            })
        ]);
        try {
            await prisma_1.prisma.groupMember.create({
                data: { group_id: req.params.id, user_id: req.params.userId }
            });
        }
        catch {
            // Already a member
        }
        res.json({ message: 'Join request approved' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/reject-join/:userId
router.post('/:id/reject-join/:userId', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.groupJoinRequest.deleteMany({
            where: { group_id: req.params.id, user_id: req.params.userId }
        });
        res.json({ message: 'Join request rejected' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/groups/:id/content-manager/:userId - Add content manager
router.post('/:id/content-manager/:userId', auth_1.authenticate, async (req, res) => {
    try {
        try {
            await prisma_1.prisma.groupContentManager.create({
                data: { group_id: req.params.id, user_id: req.params.userId }
            });
        }
        catch {
            // Ignored
        }
        res.json({ message: 'Content manager added' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/groups/:id/content-manager/:userId - Remove content manager
router.delete('/:id/content-manager/:userId', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.groupContentManager.deleteMany({
            where: { group_id: req.params.id, user_id: req.params.userId }
        });
        res.json({ message: 'Content manager removed' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=groups.js.map