import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import multer from 'multer';

const router = Router();

// Helper to map Prisma result to the expected response shape
function mapPastor(p: any) {
  if (!p) return null;
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
    content: (p.pastor_content || []).map((c: any) => ({
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
    books: (p.pastor_books || []).map((b: any) => ({
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
router.get('/', async (_req, res: Response) => {
  try {
    const pastors = await prisma.pastor.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        pastor_content: { orderBy: { created_at: 'desc' } },
        pastor_books: { orderBy: { created_at: 'desc' } },
      },
    });
    res.json(pastors.map(mapPastor));
  } catch (err) {
    console.error('List pastors error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pastors/:id
router.get('/:id', async (req, res: Response) => {
  try {
    const pastor = await prisma.pastor.findUnique({
      where: { id: req.params.id },
      include: {
        pastor_content: { orderBy: { created_at: 'desc' } },
        pastor_books: { orderBy: { created_at: 'desc' } },
      },
    });
    if (!pastor) return res.status(404).json({ error: 'Sage not found' });
    res.json(mapPastor(pastor));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pastors/by-user/:userId
router.get('/by-user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { pastor_id: true },
    });
    if (!user || !user.pastor_id) {
      return res.status(404).json({ error: 'Sage profile not found for this user' });
    }
    const pastor = await prisma.pastor.findUnique({
      where: { id: user.pastor_id },
      include: {
        pastor_content: { orderBy: { created_at: 'desc' } },
        pastor_books: { orderBy: { created_at: 'desc' } },
      },
    });
    res.json(mapPastor(pastor));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors - Admin create sage
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, title, bio, email, phone, church, photo, address, pincode, locationLink, specialties, yearsOfService, donationLink, password } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const newPastor = await prisma.$transaction(async (tx: any) => {
      const pastor = await tx.pastor.create({
        data: {
          name, title, bio, email, phone, church, photo, address, pincode,
          location_link: locationLink, specialties: specialties || [],
          years_of_service: yearsOfService || 0, donation_link: donationLink,
        },
      });

      const loginPassword = password || 'sagacity123';
      const hashedPassword = await bcrypt.hash(loginPassword, 10);

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
      } else {
        await tx.user.create({
          data: {
            name, email, password_hash: hashedPassword, role: 'pastor',
            pastor_id: pastor.id, avatar: photo, phone, address, pincode,
          },
        });
      }
      return pastor;
    });

    const fullPastor = await prisma.pastor.findUnique({
      where: { id: newPastor.id },
      include: { pastor_content: true, pastor_books: true },
    });
    res.status(201).json(mapPastor(fullPastor));
  } catch (err) {
    console.error('Create pastor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/pastors/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.pastorId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, title, bio, email, phone, church, photo, address, pincode, locationLink, specialties, yearsOfService, donationLink } = req.body;

    const updateData: any = { updated_at: new Date() };
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (church !== undefined) updateData.church = church;
    if (photo !== undefined) updateData.photo = photo;
    if (address !== undefined) updateData.address = address;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (locationLink !== undefined) updateData.location_link = locationLink;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (yearsOfService !== undefined) updateData.years_of_service = yearsOfService;
    if (donationLink !== undefined) updateData.donation_link = donationLink;

    const pastor = await prisma.pastor.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        pastor_content: { orderBy: { created_at: 'desc' } },
        pastor_books: { orderBy: { created_at: 'desc' } },
      },
    });
    res.json(mapPastor(pastor));
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Sage not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/pastors/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.pastor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sage deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Sage not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:id/content
router.post('/:id/content', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.pastorId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { type, title, content, url, thumbnail, description } = req.body;
    const status = req.user!.role === 'admin' ? 'approved' : 'pending';

    const newContent = await prisma.pastorContent.create({
      data: {
        pastor_id: req.params.id,
        type, title, content, url, thumbnail, description,
        approval_status: status as any,
      },
    });
    res.status(201).json(newContent);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:pastorId/content/:contentId/approve
router.post('/:pastorId/content/:contentId/approve', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.pastorContent.update({
      where: { id: req.params.contentId, pastor_id: req.params.pastorId },
      data: { approval_status: 'approved' },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Content not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:pastorId/content/:contentId/reject
router.post('/:pastorId/content/:contentId/reject', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.pastorContent.update({
      where: { id: req.params.contentId, pastor_id: req.params.pastorId },
      data: { approval_status: 'rejected' },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Content not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:id/books
router.post('/:id/books', authenticate, (req: AuthRequest, res: Response, next: any) => {
  upload.single('coverImage')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.pastorId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, price, pageCount, publishedDate, category } = req.body;
    const status = req.user!.role === 'admin' ? 'approved' : 'pending';

    // File check from multer
    const coverImageUrl = req.file ? (req.file as any).location : req.body.coverImage;

    const newBook = await prisma.pastorBook.create({
      data: {
        pastor_id: req.params.id, title, description,
        price: price ? Number(price) : 0,
        cover_image: coverImageUrl,
        page_count: pageCount ? Number(pageCount) : null,
        published_date: publishedDate ? new Date(publishedDate) : null,
        category,
        approval_status: status as any,
      },
    });
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Create pastor book error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:pastorId/books/:bookId/approve
router.post('/:pastorId/books/:bookId/approve', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.pastorBook.update({
      where: { id: req.params.bookId, pastor_id: req.params.pastorId },
      data: { approval_status: 'approved' },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Book not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pastors/:pastorId/books/:bookId/reject
router.post('/:pastorId/books/:bookId/reject', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.pastorBook.update({
      where: { id: req.params.bookId, pastor_id: req.params.pastorId },
      data: { approval_status: 'rejected' },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Book not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pastors/admin/pending
router.get('/admin/pending', authenticate, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const content = await prisma.pastorContent.findMany({
      where: { approval_status: 'pending' },
      include: { pastor: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
    });
    const books = await prisma.pastorBook.findMany({
      where: { approval_status: 'pending' },
      include: { pastor: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
    });
    
    res.json({
      pendingContent: content.map((c: any) => ({ ...c, pastor_name: c.pastor?.name })),
      pendingBooks: books.map((b: any) => ({ ...b, pastor_name: b.pastor?.name })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
