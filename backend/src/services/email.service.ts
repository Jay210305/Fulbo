import nodemailer from 'nodemailer';

// Types for email payloads
interface BookingEmailData {
  playerEmail: string;
  playerName: string;
  ownerEmail: string;
  ownerName: string;
  fieldName: string;
  fieldAddress: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  bookingId: string;
}

interface CancellationEmailData {
  recipientEmail: string;
  recipientName: string;
  cancelledByRole: 'player' | 'owner';
  cancelledByName: string;
  fieldName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
}

// Nodemailer transporter configuration
// Uses Gmail SMTP for testing - configure with App Password
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,        // e.g., yourapp@gmail.com
      pass: process.env.EMAIL_PASSWORD,    // Gmail App Password (not regular password)
    },
  });
};

// Helper to format date/time in Spanish
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  });
};

// Helper to format time only
const formatTime = (date: Date): string => {
  return date.toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  });
};

export class EmailService {
  private static transporter = createTransporter();

  /**
   * Send booking confirmation email to the player
   */
  static async sendBookingConfirmationToPlayer(data: BookingEmailData): Promise<void> {
    const { playerEmail, playerName, fieldName, fieldAddress, startTime, endTime, totalPrice, bookingId } = data;

    const mailOptions = {
      from: `"Fulbo ⚽" <${process.env.EMAIL_USER}>`,
      to: playerEmail,
      subject: '✅ ¡Tu reserva ha sido confirmada!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .booking-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .booking-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .booking-row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-size: 14px; }
            .value { color: #111827; font-weight: 600; }
            .total { background: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">⚽</div>
              <h1>¡Reserva Confirmada!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${playerName}</strong>,</p>
              <p>Tu reserva ha sido confirmada exitosamente. ¡Prepárate para jugar!</p>
              
              <div class="booking-card">
                <div class="booking-row">
                  <span class="label">📍 Cancha</span>
                  <span class="value">${fieldName}</span>
                </div>
                <div class="booking-row">
                  <span class="label">🗺️ Dirección</span>
                  <span class="value">${fieldAddress}</span>
                </div>
                <div class="booking-row">
                  <span class="label">📅 Fecha</span>
                  <span class="value">${formatDateTime(startTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">⏰ Horario</span>
                  <span class="value">${formatTime(startTime)} - ${formatTime(endTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">🔖 Código de reserva</span>
                  <span class="value">${bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
              
              <div class="total">
                💰 Total pagado: $${totalPrice.toLocaleString('es-AR')}
              </div>
              
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Si necesitas cancelar o modificar tu reserva, ingresa a la app de Fulbo.
              </p>
            </div>
            <div class="footer">
              <p>Este es un email automático de Fulbo. Por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de confirmación enviado a jugador: ${playerEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email al jugador:', error);
      // Don't throw - email failure shouldn't break the booking
    }
  }

  /**
   * Send new reservation notification email to the field owner
   */
  static async sendNewReservationToOwner(data: BookingEmailData): Promise<void> {
    const { ownerEmail, ownerName, playerName, playerEmail, fieldName, startTime, endTime, totalPrice, bookingId } = data;

    const mailOptions = {
      from: `"Fulbo ⚽" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: '🎉 ¡Nueva reserva recibida!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .booking-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .booking-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .booking-row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-size: 14px; }
            .value { color: #111827; font-weight: 600; }
            .revenue { background: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">💼</div>
              <h1>Nueva Reserva</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${ownerName}</strong>,</p>
              <p>¡Buenas noticias! Has recibido una nueva reserva para tu cancha.</p>
              
              <div class="booking-card">
                <div class="booking-row">
                  <span class="label">⚽ Cancha</span>
                  <span class="value">${fieldName}</span>
                </div>
                <div class="booking-row">
                  <span class="label">👤 Jugador</span>
                  <span class="value">${playerName}</span>
                </div>
                <div class="booking-row">
                  <span class="label">📧 Email</span>
                  <span class="value">${playerEmail}</span>
                </div>
                <div class="booking-row">
                  <span class="label">📅 Fecha</span>
                  <span class="value">${formatDateTime(startTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">⏰ Horario</span>
                  <span class="value">${formatTime(startTime)} - ${formatTime(endTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">🔖 Código</span>
                  <span class="value">${bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
              
              <div class="revenue">
                💰 Ingreso: $${totalPrice.toLocaleString('es-AR')}
              </div>
              
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Puedes ver todos los detalles en tu panel de administración de Fulbo.
              </p>
            </div>
            <div class="footer">
              <p>Este es un email automático de Fulbo. Por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de nueva reserva enviado al owner: ${ownerEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email al owner:', error);
    }
  }

  /**
   * Send cancellation notification email
   */
  static async sendCancellationNotification(data: CancellationEmailData): Promise<void> {
    const { recipientEmail, recipientName, cancelledByRole, cancelledByName, fieldName, startTime, endTime, bookingId } = data;

    const cancelledByText = cancelledByRole === 'player' ? 'el jugador' : 'el propietario';

    const mailOptions = {
      from: `"Fulbo ⚽" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '❌ Reserva cancelada',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .booking-card { background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca; }
            .booking-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fecaca; }
            .booking-row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-size: 14px; }
            .value { color: #111827; font-weight: 600; text-decoration: line-through; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">😔</div>
              <h1>Reserva Cancelada</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${recipientName}</strong>,</p>
              <p>Lamentamos informarte que la siguiente reserva ha sido cancelada por ${cancelledByText} <strong>${cancelledByName}</strong>.</p>
              
              <div class="booking-card">
                <div class="booking-row">
                  <span class="label">⚽ Cancha</span>
                  <span class="value">${fieldName}</span>
                </div>
                <div class="booking-row">
                  <span class="label">📅 Fecha</span>
                  <span class="value">${formatDateTime(startTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">⏰ Horario</span>
                  <span class="value">${formatTime(startTime)} - ${formatTime(endTime)}</span>
                </div>
                <div class="booking-row">
                  <span class="label">🔖 Código</span>
                  <span class="value">${bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
              
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Si tienes alguna consulta, puedes comunicarte a través de la app de Fulbo.
              </p>
            </div>
            <div class="footer">
              <p>Este es un email automático de Fulbo. Por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de cancelación enviado a: ${recipientEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email de cancelación:', error);
    }
  }

  /**
   * Send booking confirmation emails to both player and owner
   */
  static async sendBookingNotifications(data: BookingEmailData): Promise<void> {
    await Promise.all([
      this.sendBookingConfirmationToPlayer(data),
      this.sendNewReservationToOwner(data)
    ]);
  }
}
