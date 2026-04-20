// ============================================================
// Mock / Seed Data – used as fallback when the API is unreachable
// Mirrors /backend/schema-and-seed.sql
// ============================================================

import type { User, Group, Post, Prayer, Pastor } from './AppContext';

export const STORAGE_KEY = 'mission_sagacity_data';
export const DATA_VERSION_KEY = 'mission_sagacity_version';
export const CURRENT_DATA_VERSION = 10;

export const initialUsers: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@sagacity.com', role: 'admin' },
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 'pastor-user-1', name: 'John Doe', email: 'pastor.john@church.org', role: 'pastor', pastorId: 'pastor-1' },
  { id: 'pastor-user-2', name: 'Jane Smith', email: 'pastor.jane@church.org', role: 'pastor', pastorId: 'pastor-2' },
  { id: 'pastor-user-3', name: 'Michael Thompson', email: 'pastor.michael@church.org', role: 'pastor', pastorId: 'pastor-3' },
  { id: 'pastor-user-4', name: 'Sarah Williams', email: 'pastor.sarah@church.org', role: 'pastor', pastorId: 'pastor-4' },
];

export const initialGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Technology Enthusiasts',
    subtitle: 'AI, Web Dev, Cloud, IoT',
    description: 'Discuss latest tech trends and innovations.',
    type: 'public',
    status: 'approved',
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    members: ['user-1', 'user-2'],
    avatar: 'https://images.unsplash.com/photo-1683813479742-4730f91fa3ec?w=400',
    joinRequests: [],
    contentManagers: ['user-1'],
  },
  {
    id: 'group-2',
    name: 'Book Club',
    subtitle: 'Fiction, Non-Fiction, Theology, Poetry',
    description: 'Share and discuss your favorite books.',
    type: 'public',
    status: 'approved',
    createdBy: 'user-2',
    createdAt: '2025-01-02T00:00:00Z',
    members: ['user-2'],
    avatar: 'https://images.unsplash.com/photo-1709924168698-620ea32c3488?w=400',
    joinRequests: [],
    contentManagers: ['user-2'],
  },
  {
    id: 'group-3',
    name: 'Private Investors',
    subtitle: 'Stocks, Crypto, Real Estate',
    description: 'Exclusive investment discussions for serious investors.',
    type: 'private',
    status: 'approved',
    createdBy: 'user-1',
    createdAt: '2025-01-03T00:00:00Z',
    members: ['user-1'],
    avatar: 'https://images.unsplash.com/photo-1769028871759-8099b7474ac4?w=400',
    joinRequests: ['user-2'],
    contentManagers: ['user-1'],
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post-global-1',
    groupId: '__global__',
    authorId: 'admin-1',
    content: 'Welcome to Mission Sagacity! We are thrilled to have you as part of our growing community. Stay connected, join flocks, and share your wisdom with fellow members. May this space inspire you and bring you closer to your purpose.',
    commentsEnabled: true,
    createdAt: '2025-02-11T08:00:00Z',
    likes: ['user-1', 'user-2'],
    reactions: { '\u{2764}': ['user-1'], '\u{1F64F}': ['user-2'] },
    comments: [
      { id: 'comment-g1', postId: 'post-global-1', authorId: 'user-1', content: 'Thank you for building this amazing community!', createdAt: '2025-02-11T09:00:00Z' },
    ],
  },
  {
    id: 'post-1',
    groupId: 'group-1',
    authorId: 'user-1',
    content: 'What do you think about the latest AI developments? The progress in large language models has been incredible!',
    commentsEnabled: true,
    createdAt: '2025-02-10T10:00:00Z',
    likes: ['user-2'],
    reactions: { '\u{1F680}': ['user-2'], '\u{1F4A1}': ['user-2'] },
    comments: [
      { id: 'comment-1', postId: 'post-1', authorId: 'user-2', content: 'Absolutely agree! The possibilities are endless.', createdAt: '2025-02-10T11:00:00Z' },
    ],
  },
  {
    id: 'post-2',
    groupId: 'group-2',
    authorId: 'user-2',
    content: 'Just finished reading "The Midnight Library". Highly recommend it! What books are you currently reading?',
    commentsEnabled: true,
    createdAt: '2025-02-09T15:00:00Z',
    likes: [],
    reactions: { '\u{1F4DA}': ['user-2'] },
    comments: [],
  },
  {
    id: 'post-3',
    groupId: 'group-1',
    authorId: 'user-2',
    content: 'Check out this amazing workspace setup! Perfect for productivity and creativity.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    commentsEnabled: true,
    createdAt: '2025-02-08T09:00:00Z',
    likes: ['user-1'],
    reactions: { '\u{1F525}': ['user-1'] },
    comments: [],
  },
  {
    id: 'post-4',
    groupId: 'group-2',
    authorId: 'user-1',
    content: 'My recent trip to the mountains was absolutely breathtaking! Here are some highlights from the journey.',
    imageUrls: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    ],
    commentsEnabled: true,
    createdAt: '2025-02-07T12:00:00Z',
    likes: ['user-2'],
    reactions: { '\u{1F60A}': ['user-2'], '\u{2764}': ['user-2'] },
    comments: [
      { id: 'comment-4', postId: 'post-4', authorId: 'user-2', content: 'Stunning views! Where is this?', createdAt: '2025-02-07T14:00:00Z' },
    ],
  },
  {
    id: 'post-5',
    groupId: 'group-1',
    authorId: 'user-1',
    content: 'Exploring new technologies and tools for our next project. Heres a sneak peek at what were working with!',
    imageUrls: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    ],
    commentsEnabled: true,
    createdAt: '2025-02-06T18:00:00Z',
    likes: ['user-2'],
    reactions: { '\u{1F389}': ['user-2'] },
    comments: [],
  },
];

const today = new Date().toISOString().substring(0, 10);
const threeDays = new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().substring(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10);

export const initialPrayers: Prayer[] = [
  { id: 'prayer-1', userId: 'user-1', title: 'Morning Prayer', description: 'Start the day with gratitude and guidance', date: today, time: '06:00', endTime: '06:30', category: 'personal', isRecurring: true, recurringPattern: 'daily', createdAt: '2025-02-01T00:00:00Z' },
  { id: 'prayer-2', userId: 'user-1', title: 'Family Blessing', description: 'Pray for family health and happiness', date: today, time: '19:00', endTime: '19:30', category: 'family', isRecurring: false, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'prayer-3', userId: 'user-1', title: 'Community Service Prayer', description: 'Pray for those in need in our community', date: threeDays, time: '12:00', endTime: '13:00', category: 'community', isRecurring: false, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'prayer-4', userId: 'user-1', title: 'Evening Gratitude', description: 'Express thanks for the days blessings', date: tomorrow, time: '20:30', endTime: '21:00', category: 'gratitude', isRecurring: true, recurringPattern: 'daily', createdAt: '2025-02-01T00:00:00Z' },
  { id: 'prayer-5', userId: 'user-1', title: 'Sunday Worship', description: 'Weekly gathering prayer', date: nextWeek, time: '10:00', endTime: '11:30', category: 'community', isRecurring: true, recurringPattern: 'weekly', createdAt: '2025-02-01T00:00:00Z' },
];

export const initialPastors: Pastor[] = [
  {
    id: 'pastor-1',
    name: 'John Doe',
    title: 'Senior Sage',
    bio: 'John has been serving as the Senior Sage for 15 years, leading with wisdom and compassion.',
    email: 'john.doe@church.org',
    phone: '123-456-7890',
    church: 'Grace Church',
    photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
    specialties: ['Youth Ministry', 'Counseling'],
    yearsOfService: 15,
    donationLink: 'https://example.com/donate/john-doe',
    createdAt: '2025-01-01T00:00:00Z',
    content: [
      { id: 'content-1', type: 'video', title: 'Sunday Sermon: Walking in Faith', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1627931552064-36e7c340c02e?w=400', description: 'Join us for this powerful message about trusting God in uncertain times.', approvalStatus: 'approved', createdAt: '2025-01-15T00:00:00Z' },
      { id: 'content-2', type: 'writing', title: 'Reflections on Grace', content: 'Grace is not just a concept; it is the very foundation of our relationship with God.', description: 'A reflection on Gods grace in our daily lives', approvalStatus: 'approved', createdAt: '2025-01-20T00:00:00Z' },
      { id: 'content-3', type: 'photo', title: 'Community Worship Night', url: 'https://images.unsplash.com/photo-1662151820001-0c8d949304a4?w=400', description: 'What an incredible night of worship with our community!', approvalStatus: 'approved', createdAt: '2025-01-25T00:00:00Z' },
    ],
    books: [
      { id: 'book-1', title: 'Walking in Faith: A 30-Day Devotional', description: 'A powerful devotional guide for a 30-day journey through Scripture.', price: 14.99, coverImage: 'https://images.unsplash.com/photo-1610072175222-14ff9b858f5b?w=400', pageCount: 180, publishedDate: '2024-06-15', category: 'Devotional', approvalStatus: 'approved', createdAt: '2024-06-15T00:00:00Z' },
      { id: 'book-2', title: 'Grace Unlimited: Understanding Gods Love', description: 'An in-depth exploration of Gods grace and how it transforms our lives.', price: 19.99, coverImage: 'https://images.unsplash.com/photo-1761426479793-ed866b69bd40?w=400', pageCount: 256, publishedDate: '2023-11-01', category: 'Theology', approvalStatus: 'approved', createdAt: '2023-11-01T00:00:00Z' },
      { id: 'book-3', title: 'The Prayer Warriors Handbook', description: 'A practical guide to deepening your prayer life.', price: 9.99, coverImage: 'https://images.unsplash.com/photo-1766250533363-01b974b2ba32?w=400', pageCount: 120, publishedDate: '2025-01-20', category: 'Prayer', approvalStatus: 'approved', createdAt: '2025-01-20T00:00:00Z' },
      { id: 'book-5', title: 'Marriage Gods Way: A Biblical Guide for Couples', description: 'A comprehensive guide for building a Christ-centered marriage.', price: 16.99, coverImage: 'https://images.unsplash.com/photo-1750963595457-f6f2b65bf572?w=400', pageCount: 310, publishedDate: '2024-02-14', category: 'Counseling', approvalStatus: 'approved', createdAt: '2024-02-14T00:00:00Z' },
      { id: 'book-6', title: 'Songs of the Spirit: Worship Through the Psalms', description: 'A devotional journey through the Book of Psalms.', price: 11.99, coverImage: 'https://images.unsplash.com/photo-1672638224571-9af5104f4755?w=400', pageCount: 195, publishedDate: '2025-08-12', category: 'Bible Study', approvalStatus: 'approved', createdAt: '2025-08-12T00:00:00Z' },
      { id: 'book-7', title: 'Leading Like Jesus: Servant Leadership in the Church', description: 'Learn principles of servant leadership modeled by Christ himself.', price: 22.99, coverImage: 'https://images.unsplash.com/photo-1699817361584-88756e5ffc44?w=400', pageCount: 280, publishedDate: '2023-05-20', category: 'Leadership', approvalStatus: 'approved', createdAt: '2023-05-20T00:00:00Z' },
      { id: 'book-14', title: 'Unlocking the Old Testament: A Sages Guide to Ancient Texts', description: 'Journey through the Old Testament with clarity and depth.', price: 24.99, coverImage: 'https://images.unsplash.com/photo-1770310257388-c9cb96ac8d73?w=400', pageCount: 420, publishedDate: '2023-03-10', category: 'Bible Study', approvalStatus: 'approved', createdAt: '2023-03-10T00:00:00Z' },
      { id: 'book-15', title: 'The Art of Forgiveness: Letting Go and Moving Forward', description: 'Combines biblical teaching and real-life stories about forgiveness.', price: 13.99, coverImage: 'https://images.unsplash.com/photo-1638866412154-71a64b5e46c1?w=400', pageCount: 190, publishedDate: '2024-10-05', category: 'Christian Living', approvalStatus: 'approved', createdAt: '2024-10-05T00:00:00Z' },
      { id: 'book-16', title: 'Raising Kingdom Kids: A Parents Blueprint', description: 'A practical parenting guide with God-centered values.', price: 15.99, coverImage: 'https://images.unsplash.com/flagged/photo-1595523667810-367dd72653b6?w=400', pageCount: 235, publishedDate: '2025-06-18', category: 'Parenting', approvalStatus: 'approved', createdAt: '2025-06-18T00:00:00Z' },
    ],
  },
  {
    id: 'pastor-2',
    name: 'Jane Smith',
    title: 'Youth Sage',
    bio: 'Jane is dedicated to youth ministry, inspiring the next generation with faith and hope.',
    email: 'jane.smith@church.org',
    phone: '098-765-4321',
    church: 'Grace Church',
    photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
    specialties: ['Youth Ministry'],
    yearsOfService: 5,
    donationLink: 'https://example.com/donate/jane-smith',
    createdAt: '2025-01-02T00:00:00Z',
    content: [
      { id: 'content-4', type: 'photo', title: 'Youth Bible Study', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400', description: 'Our youth group diving deep into Gods Word this week!', approvalStatus: 'approved', createdAt: '2025-01-18T00:00:00Z' },
      { id: 'content-5', type: 'writing', title: 'Hope for the Next Generation', content: 'Our youth are the future of the church, and I am constantly amazed by their passion.', approvalStatus: 'approved', createdAt: '2025-01-22T00:00:00Z' },
    ],
    books: [
      { id: 'book-4', title: 'Ignite: Faith for the Next Generation', description: 'A dynamic guide for young believers looking to grow in their faith.', price: 12.99, coverImage: 'https://images.unsplash.com/photo-1772038288458-c469cd946bf2?w=400', pageCount: 200, publishedDate: '2025-03-10', category: 'Youth Ministry', approvalStatus: 'approved', createdAt: '2025-03-10T00:00:00Z' },
      { id: 'book-8', title: 'Finding Your Purpose: A Teens Guide to Gods Plan', description: 'Written for teens navigating lifes biggest questions.', price: 10.99, coverImage: 'https://images.unsplash.com/photo-1769184615203-78b35efc984b?w=400', pageCount: 165, publishedDate: '2025-09-01', category: 'Youth Ministry', approvalStatus: 'approved', createdAt: '2025-09-01T00:00:00Z' },
      { id: 'book-9', title: 'Social Media & The Soul: Navigating Digital Life with Faith', description: 'Practical wisdom for setting digital boundaries.', price: 8.99, coverImage: 'https://images.unsplash.com/photo-1571916234808-adf437ac1644?w=400', pageCount: 140, publishedDate: '2026-01-15', category: 'Christian Living', approvalStatus: 'approved', createdAt: '2026-01-15T00:00:00Z' },
    ],
  },
  {
    id: 'pastor-3',
    name: 'Michael Thompson',
    title: 'Associate Sage',
    bio: 'Michael has a heart for community outreach and missions work.',
    email: 'michael.t@church.org',
    phone: '555-234-5678',
    church: 'New Hope Fellowship',
    photo: 'https://images.unsplash.com/photo-1728827895321-7cfad9d63ad1?w=400',
    specialties: ['Discipleship', 'Missions', 'Small Groups'],
    yearsOfService: 10,
    donationLink: 'https://example.com/donate/michael-thompson',
    createdAt: '2025-01-03T00:00:00Z',
    content: [
      { id: 'content-6', type: 'writing', title: 'The Power of Small Groups', content: 'There is something powerful about gathering together in small, intimate groups to study Gods Word.', approvalStatus: 'approved', createdAt: '2025-01-16T00:00:00Z' },
      { id: 'content-7', type: 'photo', title: 'Mission Trip to Guatemala', url: 'https://images.unsplash.com/photo-1760992004000-69b29eb0384c?w=400', description: 'Our team spent two weeks serving communities in Guatemala.', approvalStatus: 'approved', createdAt: '2025-01-28T00:00:00Z' },
    ],
    books: [
      { id: 'book-10', title: 'The Disciples Journey: From Believer to World-Changer', description: 'A comprehensive 12-week discipleship curriculum.', price: 17.99, coverImage: 'https://images.unsplash.com/photo-1650437732428-9854461455d4?w=400', pageCount: 240, publishedDate: '2024-09-15', category: 'Discipleship', approvalStatus: 'approved', createdAt: '2024-09-15T00:00:00Z' },
      { id: 'book-11', title: 'Beyond the Walls: Taking Church to the Community', description: 'A rallying call for churches to engage their communities.', price: 15.99, coverImage: 'https://images.unsplash.com/photo-1765947382559-93260e5d6c89?w=400', pageCount: 215, publishedDate: '2025-04-22', category: 'Missions', approvalStatus: 'approved', createdAt: '2025-04-22T00:00:00Z' },
      { id: 'book-12', title: 'Rest for the Restless: Finding Peace in a Busy World', description: 'Rediscover the biblical practice of Sabbath rest.', price: 13.99, coverImage: 'https://images.unsplash.com/photo-1760857224786-15621b02ea64?w=400', pageCount: 175, publishedDate: '2025-11-10', category: 'Christian Living', approvalStatus: 'approved', createdAt: '2025-11-10T00:00:00Z' },
      { id: 'book-13', title: 'Small Group Leaders Toolkit', description: 'The essential handbook for small group ministry leaders.', price: 7.99, coverImage: 'https://images.unsplash.com/photo-1733710087753-3f9aff2d6493?w=400', pageCount: 98, publishedDate: '2024-01-08', category: 'Leadership', approvalStatus: 'approved', createdAt: '2024-01-08T00:00:00Z' },
    ],
  },
  {
    id: 'pastor-4',
    name: 'Sarah Williams',
    title: 'Worship Sage',
    bio: 'Sarah leads the worship ministry with passion and creativity.',
    email: 'sarah.w@church.org',
    phone: '555-987-6543',
    church: 'Harvest Community Church',
    photo: 'https://images.unsplash.com/photo-1752317591547-745de02a572e?w=400',
    specialties: ['Worship', 'Creative Arts', 'Prayer Ministry'],
    yearsOfService: 8,
    donationLink: 'https://example.com/donate/sarah-williams',
    createdAt: '2025-01-04T00:00:00Z',
    content: [
      { id: 'content-8', type: 'writing', title: 'The Heart of Worship', content: 'Worship is not about the songs we sing or the instruments we play. It is about the posture of our hearts.', approvalStatus: 'approved', createdAt: '2025-01-17T00:00:00Z' },
      { id: 'content-9', type: 'photo', title: 'Worship Night Live', url: 'https://images.unsplash.com/photo-1672638224571-9af5104f4755?w=400', description: 'An incredible evening of worship and prayer.', approvalStatus: 'approved', createdAt: '2025-01-30T00:00:00Z' },
    ],
    books: [
      { id: 'book-20', title: 'A New Song: Rediscovering Worship in the Modern Church', description: 'A thoughtful exploration of worship in contemporary church culture.', price: 16.49, coverImage: 'https://images.unsplash.com/photo-1668786977637-f2cede057905?w=400', pageCount: 220, publishedDate: '2024-07-20', category: 'Worship', approvalStatus: 'approved', createdAt: '2024-07-20T00:00:00Z' },
      { id: 'book-21', title: 'Prayers in the Dark: Finding Light When Life Hurts', description: 'A raw and honest book about praying through hardship.', price: 12.99, coverImage: 'https://images.unsplash.com/photo-1579913735975-5f4b3f9e1c1e?w=400', pageCount: 160, publishedDate: '2025-02-28', category: 'Prayer', approvalStatus: 'approved', createdAt: '2025-02-28T00:00:00Z' },
      { id: 'book-22', title: 'The Creative Christian: Using Your Gifts for Gods Glory', description: 'Encourages creatives to see their talents as gifts from God.', price: 14.99, coverImage: 'https://images.unsplash.com/photo-1619968747465-f56008f0da50?w=400', pageCount: 185, publishedDate: '2025-10-15', category: 'Christian Living', approvalStatus: 'approved', createdAt: '2025-10-15T00:00:00Z' },
      { id: 'book-23', title: 'Still Waters: A 21-Day Journey to Inner Peace', description: 'A 21-day devotional guiding readers into quiet presence of God.', price: 10.99, coverImage: 'https://images.unsplash.com/photo-1761491499504-46df069334c1?w=400', pageCount: 110, publishedDate: '2026-02-01', category: 'Devotional', approvalStatus: 'approved', createdAt: '2026-02-01T00:00:00Z' },
      { id: 'book-24', title: 'New Beginnings: 40 Days of Renewal and Restoration', description: 'A 40-day devotional about Gods promises of renewal.', price: 18.99, coverImage: 'https://images.unsplash.com/photo-1763060869007-fc10548b0aae?w=400', pageCount: 250, publishedDate: '2024-12-25', category: 'Devotional', approvalStatus: 'approved', createdAt: '2024-12-25T00:00:00Z' },
      { id: 'book-25', title: 'Wilderness Worship: Encountering God in the Mountains', description: 'Theology, personal stories, and breathtaking imagery about creation.', price: 19.99, coverImage: 'https://images.unsplash.com/photo-1710453650585-05d2f4b966c4?w=400', pageCount: 195, publishedDate: '2025-05-10', category: 'Theology', approvalStatus: 'approved', createdAt: '2025-05-10T00:00:00Z' },
    ],
  },
];

// ---- localStorage helpers ----

export function loadFromStorage(): {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  posts: Post[];
  prayers: Prayer[];
  pastors: Pastor[];
} | null {
  const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
  const isOutdated = !savedVersion || Number(savedVersion) < CURRENT_DATA_VERSION;

  if (isOutdated) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
    return null; // use defaults
  }

  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveToStorage(data: {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  posts: Post[];
  prayers: Prayer[];
  pastors: Pastor[];
}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
}