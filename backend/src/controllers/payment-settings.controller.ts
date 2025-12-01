import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PaymentSettingsService } from '../services/payment-settings.service';

export class PaymentSettingsController {
  /**
   * GET /api/manager/payment-settings
   * Get payment settings for the authenticated manager
   */
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;

      const settings = await PaymentSettingsService.getByManagerId(managerId);

      if (!settings) {
        // Return default settings if none exist
        return res.json({
          yapeEnabled: false,
          yapePhone: null,
          plinEnabled: false,
          plinPhone: null,
          bankTransferEnabled: false,
          bankName: null,
          bankAccountNumber: null,
          bankAccountHolder: null,
          bankCci: null,
          cashEnabled: true,
        });
      }

      res.json({
        id: settings.setting_id,
        yapeEnabled: settings.yape_enabled,
        yapePhone: settings.yape_phone,
        plinEnabled: settings.plin_enabled,
        plinPhone: settings.plin_phone,
        bankTransferEnabled: settings.bank_transfer_enabled,
        bankName: settings.bank_name,
        bankAccountNumber: settings.bank_account_number,
        bankAccountHolder: settings.bank_account_holder,
        bankCci: settings.bank_cci,
        cashEnabled: settings.cash_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      });
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ message: 'Error al obtener la configuración de pagos' });
    }
  }

  /**
   * PUT /api/manager/payment-settings
   * Create or update payment settings
   */
  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const managerId = req.user.id;
      const {
        yapeEnabled,
        yapePhone,
        plinEnabled,
        plinPhone,
        bankTransferEnabled,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        bankCci,
        cashEnabled,
      } = req.body;

      // Validate phone numbers if enabled
      if (yapeEnabled && !yapePhone) {
        return res.status(400).json({ message: 'El número de Yape es requerido si Yape está habilitado' });
      }
      if (plinEnabled && !plinPhone) {
        return res.status(400).json({ message: 'El número de Plin es requerido si Plin está habilitado' });
      }
      if (bankTransferEnabled && (!bankName || !bankAccountNumber || !bankAccountHolder)) {
        return res.status(400).json({ 
          message: 'Los datos bancarios son requeridos si la transferencia está habilitada' 
        });
      }

      const settings = await PaymentSettingsService.upsert(managerId, {
        yapeEnabled,
        yapePhone,
        plinEnabled,
        plinPhone,
        bankTransferEnabled,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        bankCci,
        cashEnabled,
      });

      res.json({
        message: 'Configuración de pagos actualizada exitosamente',
        settings: {
          id: settings.setting_id,
          yapeEnabled: settings.yape_enabled,
          yapePhone: settings.yape_phone,
          plinEnabled: settings.plin_enabled,
          plinPhone: settings.plin_phone,
          bankTransferEnabled: settings.bank_transfer_enabled,
          bankName: settings.bank_name,
          bankAccountNumber: settings.bank_account_number,
          bankAccountHolder: settings.bank_account_holder,
          bankCci: settings.bank_cci,
          cashEnabled: settings.cash_enabled,
          updatedAt: settings.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      res.status(500).json({ message: 'Error al actualizar la configuración de pagos' });
    }
  }
}
