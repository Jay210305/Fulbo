import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { protect } from '../middlewares/auth.middleware'; // Solo usuarios logueados reservan

const router = Router();

// Crear una reserva
router.post('/', protect, BookingController.createBooking);

// Obtener una reserva por ID
router.get('/:bookingId', protect, BookingController.getBooking);

// Cancelar una reserva
router.patch('/:bookingId/cancel', protect, BookingController.cancelBooking);

export default router;