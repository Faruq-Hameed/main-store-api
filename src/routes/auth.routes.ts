import { Router } from 'express';
import AuthController from '../controllers/auth.controller';


const router = Router();

router.post('/', AuthController.createManager);
router.post('/login', AuthController.login);

export default router;
