import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware'; // Importar seguridad

const router = Router();

// Historial
router.get('/:roomId/messages', ChatController.getHistory);

// Agregar usuario (Protegido)
router.post('/:roomId/users', protect, ChatController.addUserToRoom);

// Ver mis chats (Protegido)
router.get('/', protect, ChatController.getMyChats);

export default router;