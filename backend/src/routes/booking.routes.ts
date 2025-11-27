import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { protect } from '../middlewares/auth.middleware'; // Solo usuarios logueados reservan

const router = Router();

router.post('/', protect, BookingController.createBooking);

export default router;