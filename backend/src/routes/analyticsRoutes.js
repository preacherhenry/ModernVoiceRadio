import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin', 'super_admin'));

router.get('/overview', analyticsController.overview);
router.get('/countries', analyticsController.countries);
router.get('/cities', analyticsController.cities);
router.get('/devices', analyticsController.devices);
router.get('/trend', analyticsController.trend);

export default router;
