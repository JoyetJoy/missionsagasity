"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Helper: Map Prisma post to expected response format
function mapPost(p) {
    if (!p)
        return null;
    const reactionsMap = {};
    if (p.reactions) {
        p.reactions.forEach((r) => {
            if (!reactionsMap[r.reaction])
                reactionsMap[r.reaction] = [];
            reactionsMap[r.reaction].push(r.user_id);
        });
    }
    return {
        id: p.id,
        groupId: p.group_id || '__global__',
        authorId: p.author_id,
        content: p.content,
        imageUrl: p.image_url,
        imageUrls: p.image_urls || [],
        fileUrl: p.file_url,
        fileName: p.file_name,
        commentsEnabled: p.comments_enabled,
        createdAt: p.created_at,
        likes: (p.likes || []).map((l) => l.user_id),
        reactions: reactionsMap,
        comments: (p.comments || []).map((c) => ({
            id: c.id,
            postId: c.post_id,
            authorId: c.author_id,
            content: c.content,
            createdAt: c.created_at,
        })),
        meeting: p.post_meeting ? {
            title: p.post_meeting.title,
            date: p.post_meeting.date instanceof Date ? p.post_meeting.date.toISOString().split('T')[0] : p.post_meeting.date,
            time: p.post_meeting.time instanceof Date ? p.post_meeting.time.toISOString().substring(11, 16) : p.post_meeting.time,
            endTime: p.post_meeting.end_time ? (p.post_meeting.end_time instanceof Date ? p.post_meeting.end_time.toISOString().substring(11, 16) : p.post_meeting.end_time) : undefined,
            meetLink: p.post_meeting.meet_link,
        } : undefined,
    };
}
const postIncludes = {
    likes: { select: { user_id: true } },
    reactions: { select: { user_id: true, reaction: true } },
    comments: { orderBy: { created_at: 'asc' } },
    post_meeting: true,
};
// GET /api/posts/feed - Wisdom Feed (public posts + user's group posts + global broadcasts)
router.get('/feed', auth_1.optionalAuth, async (req, res) => {
    try {
        let posts;
        if (req.user) {
            posts = await prisma_1.prisma.post.findMany({
                where: {
                    OR: [
                        { group_id: null },
                        {
                            group: {
                                status: 'approved',
                                OR: [
                                    { type: 'public' },
                                    { members: { some: { user_id: req.user.id } } }
                                ]
                            }
                        }
                    ]
                },
                include: postIncludes,
                orderBy: { created_at: 'desc' },
                take: 50
            });
        }
        else {
            // Non-authenticated
            posts = await prisma_1.prisma.post.findMany({
                where: {
                    OR: [
                        { group_id: null },
                        { group: { status: 'approved', type: 'public' } }
                    ]
                },
                include: postIncludes,
                orderBy: { created_at: 'desc' },
                take: 20
            });
        }
        res.json(posts.map(mapPost));
    }
    catch (err) {
        console.error('Feed error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/posts/group/:groupId - Posts for a specific group
router.get('/group/:groupId', auth_1.optionalAuth, async (req, res) => {
    try {
        const posts = await prisma_1.prisma.post.findMany({
            where: { group_id: req.params.groupId },
            include: postIncludes,
            orderBy: { created_at: 'desc' }
        });
        res.json(posts.map(mapPost));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/posts/:id
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({
            where: { id: req.params.id },
            include: postIncludes
        });
        if (!post)
            return res.status(404).json({ error: 'Post not found' });
        res.json(mapPost(post));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/posts - Create a post
router.post('/', auth_1.authenticate, (req, res, next) => {
    upload_1.upload.array('files', 10)(req, res, (err) => {
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
        const { groupId, content, commentsEnabled, meeting } = req.body;
        // In multipart/form-data, numbers/booleans might come as strings
        const isCommentsEnabled = commentsEnabled === 'true' || commentsEnabled === true || commentsEnabled === undefined;
        if (!groupId || !content) {
            return res.status(400).json({ error: 'groupId and content are required' });
        }
        // Process uploaded files
        const files = req.files;
        const imageUrl = files && files.length > 0 ? files[0].location : null;
        const imageUrls = files ? files.map((f) => f.location) : [];
        if (groupId === '__global__') {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Only admins can create broadcast posts' });
            }
            const newPost = await prisma_1.prisma.$transaction(async (tx) => {
                const p = await tx.post.create({
                    data: {
                        group_id: null,
                        author_id: req.user.id,
                        content,
                        image_url: imageUrl,
                        image_urls: imageUrls,
                        comments_enabled: isCommentsEnabled
                    }
                });
                if (meeting) {
                    await tx.postMeeting.create({
                        data: {
                            post_id: p.id,
                            title: meeting.title,
                            date: new Date(meeting.date),
                            time: new Date(`1970-01-01T${meeting.time.length === 5 ? meeting.time + ':00' : meeting.time}Z`),
                            end_time: meeting.endTime ? new Date(`1970-01-01T${meeting.endTime.length === 5 ? meeting.endTime + ':00' : meeting.endTime}Z`) : null,
                            meet_link: meeting.meetLink
                        }
                    });
                }
                return p;
            });
            const fullPost = await prisma_1.prisma.post.findUnique({ where: { id: newPost.id }, include: postIncludes });
            return res.status(201).json(mapPost(fullPost));
        }
        // Check posting permission
        const group = await prisma_1.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                content_managers: { where: { user_id: req.user.id } }
            }
        });
        if (!group || (group.created_by !== req.user.id && group.content_managers.length === 0 && req.user.role !== 'admin')) {
            return res.status(403).json({ error: 'You do not have permission to post in this flock' });
        }
        const newPost = await prisma_1.prisma.$transaction(async (tx) => {
            const p = await tx.post.create({
                data: {
                    group_id: groupId,
                    author_id: req.user.id,
                    content,
                    image_url: imageUrl,
                    image_urls: imageUrls,
                    comments_enabled: isCommentsEnabled
                }
            });
            if (meeting) {
                // Parse meeting if it comes as a JSON string (common in FormData)
                const m = typeof meeting === 'string' ? JSON.parse(meeting) : meeting;
                await tx.postMeeting.create({
                    data: {
                        post_id: p.id,
                        title: m.title,
                        date: new Date(m.date),
                        time: new Date(`1970-01-01T${m.time.length === 5 ? m.time + ':00' : m.time}Z`),
                        end_time: m.endTime ? new Date(`1970-01-01T${m.endTime.length === 5 ? m.endTime + ':00' : m.endTime}Z`) : null,
                        meet_link: m.meetLink
                    }
                });
            }
            return p;
        });
        const fullPost = await prisma_1.prisma.post.findUnique({ where: { id: newPost.id }, include: postIncludes });
        res.status(201).json(mapPost(fullPost));
    }
    catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/posts/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { content, imageUrl, meeting } = req.body;
        const existing = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!existing)
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Post not found or unauthorized' });
        }
        const updatedPost = await prisma_1.prisma.$transaction(async (tx) => {
            const p = await tx.post.update({
                where: { id: req.params.id },
                data: {
                    content: content !== undefined ? content : existing.content,
                    image_url: imageUrl !== undefined ? imageUrl : existing.image_url,
                    updated_at: new Date()
                }
            });
            if (meeting !== undefined) {
                await tx.postMeeting.deleteMany({ where: { post_id: req.params.id } });
                if (meeting) {
                    await tx.postMeeting.create({
                        data: {
                            post_id: req.params.id,
                            title: meeting.title,
                            date: new Date(meeting.date),
                            time: new Date(`1970-01-01T${meeting.time.length === 5 ? meeting.time + ':00' : meeting.time}Z`),
                            end_time: meeting.endTime ? new Date(`1970-01-01T${meeting.endTime.length === 5 ? meeting.endTime + ':00' : meeting.endTime}Z`) : null,
                            meet_link: meeting.meetLink
                        }
                    });
                }
            }
            return p;
        });
        const fullPost = await prisma_1.prisma.post.findUnique({ where: { id: updatedPost.id }, include: postIncludes });
        res.json(mapPost(fullPost));
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/posts/:id
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const existing = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!existing)
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Post not found or unauthorized' });
        }
        await prisma_1.prisma.post.delete({ where: { id: req.params.id } });
        res.json({ message: 'Post deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', auth_1.authenticate, async (req, res) => {
    try {
        try {
            await prisma_1.prisma.postLike.create({
                data: { post_id: req.params.id, user_id: req.user.id }
            });
            res.json({ liked: true });
        }
        catch {
            await prisma_1.prisma.postLike.deleteMany({
                where: { post_id: req.params.id, user_id: req.user.id }
            });
            res.json({ liked: false });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/posts/:id/react - Toggle reaction
router.post('/:id/react', auth_1.authenticate, async (req, res) => {
    try {
        const { reaction } = req.body;
        if (!reaction)
            return res.status(400).json({ error: 'Reaction emoji is required' });
        try {
            await prisma_1.prisma.postReaction.create({
                data: { post_id: req.params.id, user_id: req.user.id, reaction }
            });
            res.json({ reacted: true });
        }
        catch {
            await prisma_1.prisma.postReaction.deleteMany({
                where: { post_id: req.params.id, user_id: req.user.id, reaction }
            });
            res.json({ reacted: false });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/posts/:id/comment
router.post('/:id/comment', auth_1.authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ error: 'Content is required' });
        const newComment = await prisma_1.prisma.comment.create({
            data: {
                post_id: req.params.id,
                author_id: req.user.id,
                content
            }
        });
        res.status(201).json({
            id: newComment.id,
            postId: newComment.post_id,
            authorId: newComment.author_id,
            content: newComment.content,
            createdAt: newComment.created_at,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map