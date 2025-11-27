import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();

// GET http://localhost:4000/api/chats/:roomId/messages
router.get('/:roomId/messages', ChatController.getHistory);

export default router;