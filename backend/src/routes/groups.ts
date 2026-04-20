import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Helper to format Prisma group to expected response format
function formatGroup(g: any) {
  return {
    ...g,
    member_count: g._count?.members ?? g.members?.length ?? 0,
    members: (g.members || []).map((m: any) => m.user_id),
    join_requests: (g.join_requests || []).map((jr: any) => jr.user_id),
    content_managers: (g.content_managers || []).map((cm: any) => cm.user_id),
  };
}

const groupIncludes = {
  members: { select: { user_id: true } },
  join_requests: { select: { user_id: true } },
  content_managers: { select: { user_id: true } },
  _count: { select: { members: true } }
};

// GET /api/groups - List approved groups (public), all for admin
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const whereClause = req.user?.role === 'admin' ? {} : { status: 'approved' as any };
    
    const groups = await prisma.group.findMany({
      where: whereClause,
      include: groupIncludes,
      orderBy: { created_at: 'desc' }
    });

    res.json(groups.map(formatGroup));
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: groupIncludes
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(formatGroup(group));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups - Create a flock
router.post('/', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, subtitle, description, type } = req.body;
    let { avatar } = req.body;

    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const newGroup = await prisma.$transaction(async (tx: any) => {
      const g = await tx.group.create({
        data: {
          name,
          subtitle: subtitle || null,
          description,
          type: type || 'public',
          status: 'pending',
          created_by: req.user!.id,
          avatar: avatar || null,
        }
      });
      
      await tx.groupMember.create({ data: { group_id: g.id, user_id: req.user!.id } });
      await tx.groupContentManager.create({ data: { group_id: g.id, user_id: req.user!.id } });
      
      return g;
    });

    res.status(201).json({ ...newGroup, members: [req.user!.id], content_managers: [req.user!.id], join_requests: [] });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/groups/:id - Update group
router.put('/:id', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, subtitle, description, type } = req.body;
    let { avatar } = req.body;

    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }
    
    const existing = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Group not found or unauthorized' });

    if (existing.created_by !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Group not found or unauthorized' });
    }

    const updateData: any = { updated_at: new Date() };
    if (name !== undefined) updateData.name = name;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (avatar !== undefined) updateData.avatar = avatar;

    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/approve - Admin approve group
router.post('/:id/approve', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: { status: 'approved', updated_at: new Date() }
    });
    res.json(group);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Group not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/reject - Admin reject group
router.post('/:id/reject', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: { status: 'rejected', updated_at: new Date() }
    });
    res.json(group);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Group not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/join - Join a public group
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.type === 'private') {
      return res.status(400).json({ error: 'Use request-join for private groups' });
    }

    try {
      await prisma.groupMember.create({
        data: { group_id: req.params.id, user_id: req.user!.id }
      });
    } catch {
       // Ignore duplicate unique constraints (already joined)
    }
    res.json({ message: 'Joined group' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/leave
router.post('/:id/leave', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groupMember.deleteMany({
      where: { group_id: req.params.id, user_id: req.user!.id }
    });
    await prisma.groupContentManager.deleteMany({
      where: { group_id: req.params.id, user_id: req.user!.id }
    });
    res.json({ message: 'Left group' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/request-join
router.post('/:id/request-join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    try {
      await prisma.groupJoinRequest.create({
        data: { group_id: req.params.id, user_id: req.user!.id }
      });
    } catch {
      // Ignore if exists
    }
    res.json({ message: 'Join request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/approve-join/:userId
router.post('/:id/approve-join/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.created_by !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only flock creator or admin can approve' });
    }

    await prisma.$transaction([
      prisma.groupJoinRequest.deleteMany({
        where: { group_id: req.params.id, user_id: req.params.userId }
      })
    ]);
    
    try {
      await prisma.groupMember.create({
         data: { group_id: req.params.id, user_id: req.params.userId }
      });
    } catch {
       // Already a member
    }

    res.json({ message: 'Join request approved' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/reject-join/:userId
router.post('/:id/reject-join/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groupJoinRequest.deleteMany({
      where: { group_id: req.params.id, user_id: req.params.userId }
    });
    res.json({ message: 'Join request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/content-manager/:userId - Add content manager
router.post('/:id/content-manager/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    try {
      await prisma.groupContentManager.create({
        data: { group_id: req.params.id, user_id: req.params.userId }
      });
    } catch {
      // Ignored
    }
    res.json({ message: 'Content manager added' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/groups/:id/content-manager/:userId - Remove content manager
router.delete('/:id/content-manager/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groupContentManager.deleteMany({
      where: { group_id: req.params.id, user_id: req.params.userId }
    });
    res.json({ message: 'Content manager removed' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
