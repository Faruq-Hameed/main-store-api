import { Router } from 'express';
import { login,createManager } from '../controllers/auth.controller';
import { Authenticator } from '../middlewares/auth.middlewares';


const router = Router();

router.post('/', createManager);
router.post('/login', login);

export default router;
