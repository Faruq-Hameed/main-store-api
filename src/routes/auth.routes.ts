import { Router } from 'express';
import { login, getMe, register } from '../controllers/auth.controllers';
import { protect } from '../middlewares/auth.middlewares';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;