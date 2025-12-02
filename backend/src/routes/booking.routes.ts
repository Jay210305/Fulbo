import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { 
  createBookingSchema, 
  rescheduleBookingSchema, 
  bookingIdParamSchema,
  fieldIdParamSchema,
  fieldBookingsQuerySchema 
} from '../schemas/booking.schema';

const router = Router();

// Crear una reserva
router.post('/', protect, validate({ body: createBookingSchema }), BookingController.createBooking);

// Obtener reservas del usuario actual (historial del jugador)
router.get('/user', protect, BookingController.getUserBookings);

// Obtener reservas de una cancha específica (vista de calendario)
router.get('/field/:fieldId', protect, validate({ params: fieldIdParamSchema, query: fieldBookingsQuerySchema }), BookingController.getFieldBookings);

// Obtener una reserva por ID
router.get('/:bookingId', protect, validate({ params: bookingIdParamSchema }), BookingController.getBooking);

// Cancelar una reserva
router.patch('/:bookingId/cancel', protect, validate({ params: bookingIdParamSchema }), BookingController.cancelBooking);

// Reprogramar una reserva
router.patch('/:bookingId/reschedule', protect, validate({ params: bookingIdParamSchema, body: rescheduleBookingSchema }), BookingController.rescheduleBooking);

export default router;