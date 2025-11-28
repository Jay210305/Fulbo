/**
 * Script para probar el servicio de emails
 * Ejecutar: npx ts-node src/scripts/test-email.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const testEmail = async () => {
  console.log('📧 Probando configuración de email...\n');

  // Verificar variables de entorno
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.error('❌ Error: EMAIL_USER o EMAIL_PASSWORD no están configurados en .env');
    process.exit(1);
  }

  console.log(`✅ EMAIL_USER: ${emailUser}`);
  console.log(`✅ EMAIL_PASSWORD: ${'*'.repeat(emailPassword.length)} (oculto)\n`);

  // Crear transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Verificar conexión
  console.log('🔄 Verificando conexión con Gmail SMTP...');
  
  try {
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail SMTP!\n');
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que 2FA esté habilitado en tu cuenta de Google');
    console.log('   2. Genera una nueva App Password en: https://myaccount.google.com/apppasswords');
    console.log('   3. Asegúrate de que la contraseña no tenga espacios');
    process.exit(1);
  }

  // Enviar email de prueba
  console.log('📤 Enviando email de prueba...\n');

  const mailOptions = {
    from: `"Fulbo Test ⚽" <${emailUser}>`,
    to: emailUser, // Enviamos a nosotros mismos para probar
    subject: '✅ Test de Email - Fulbo App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success { background: #d1fae5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; text-align: center; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">⚽ Fulbo App</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2 style="color: #059669; margin: 0;">✅ ¡Email configurado correctamente!</h2>
            </div>
            <p style="margin-top: 20px; text-align: center; color: #374151;">
              Si estás viendo este mensaje, el servicio de emails está funcionando perfectamente.
            </p>
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              Fecha del test: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
            </p>
          </div>
          <div class="footer">
            <p>Este es un email de prueba automático.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ ¡Email enviado exitosamente!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Enviado a: ${emailUser}`);
    console.log('\n🎉 ¡El servicio de emails está funcionando correctamente!');
    console.log('   Revisa tu bandeja de entrada (o spam) para ver el email de prueba.');
  } catch (error: any) {
    console.error('❌ Error enviando email:', error.message);
    process.exit(1);
  }
};

testEmail();
