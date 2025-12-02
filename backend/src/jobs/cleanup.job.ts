import cron from 'node-cron';
import { BookingService } from '../services/booking.service';

/**
 * Initialize all scheduled jobs for the application.
 * This function should be called once when the server starts.
 */
export function initScheduledJobs(): void {
  // Schedule cleanup of expired pending bookings every 10 minutes
  // Cron expression: */10 * * * * = every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('⏰ Running scheduled cleanup for expired bookings...');
      const cancelledCount = await BookingService.cancelExpiredBookings();
      
      if (cancelledCount === 0) {
        console.log('✅ No expired bookings to clean up');
      }
    } catch (error) {
      console.error('❌ Error in scheduled booking cleanup:', error);
      // Don't rethrow - we don't want to crash the server
    }
  });

  console.log('📅 Scheduled jobs initialized successfully');
}
