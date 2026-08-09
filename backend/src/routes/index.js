import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import presenterRoutes from './presenterRoutes.js';
import programRoutes from './programRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import newsRoutes from './newsRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import advertisementRoutes from './advertisementRoutes.js';
import songRequestRoutes from './songRequestRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import audioStreamRoutes from './audioStreamRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import contactRoutes from './contactRoutes.js';
import chatRoutes from './chatRoutes.js';
import searchRoutes from './searchRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'Modern Voice Radio API is healthy', timestamp: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/presenters', presenterRoutes);
router.use('/programs', programRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/news', newsRoutes);
router.use('/gallery', galleryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/advertisements', advertisementRoutes);
router.use('/song-requests', songRequestRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/downloads', downloadRoutes);
router.use('/streams', audioStreamRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/contact', contactRoutes);
router.use('/chat', chatRoutes);
router.use('/search', searchRoutes);

export default router;
