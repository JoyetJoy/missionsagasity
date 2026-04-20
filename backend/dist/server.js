"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const groups_1 = __importDefault(require("./routes/groups"));
const posts_1 = __importDefault(require("./routes/posts"));
const prayers_1 = __importDefault(require("./routes/prayers"));
const pastors_1 = __importDefault(require("./routes/pastors"));
dotenv_1.default.config({ override: true });
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '8080', 10);
// ---- Middleware ----
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
        : true, // Allow all origins in development
    credentials: true,
}));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
// Auth endpoints get stricter rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many authentication attempts.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
// ---- Routes ----
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/groups', groups_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/prayers', prayers_1.default);
app.use('/api/pastors', pastors_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'mission-sagacity-api',
        timestamp: new Date().toISOString(),
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// ---- Start ----
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mission Sagacity API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database URL: ${process.env.DATABASE_URL?.split('@')[1]}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map