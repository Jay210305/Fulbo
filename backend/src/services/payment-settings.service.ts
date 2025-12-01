import { prisma } from '../config/prisma';

// --- DTOs ---
interface UpdatePaymentSettingsDto {
  yapeEnabled?: boolean;
  yapePhone?: string;
  plinEnabled?: boolean;
  plinPhone?: string;
  bankTransferEnabled?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankCci?: string;
  cashEnabled?: boolean;
}

export class PaymentSettingsService {
  /**
   * Get payment settings for a manager
   */
  static async getByManagerId(managerId: string) {
    return prisma.payment_settings.findUnique({
      where: { manager_id: managerId },
    });
  }

  /**
   * Create or update payment settings
   */
  static async upsert(managerId: string, data: UpdatePaymentSettingsDto) {
    const existing = await prisma.payment_settings.findUnique({
      where: { manager_id: managerId },
    });

    if (existing) {
      return prisma.payment_settings.update({
        where: { manager_id: managerId },
        data: {
          yape_enabled: data.yapeEnabled ?? existing.yape_enabled,
          yape_phone: data.yapePhone ?? existing.yape_phone,
          plin_enabled: data.plinEnabled ?? existing.plin_enabled,
          plin_phone: data.plinPhone ?? existing.plin_phone,
          bank_transfer_enabled: data.bankTransferEnabled ?? existing.bank_transfer_enabled,
          bank_name: data.bankName ?? existing.bank_name,
          bank_account_number: data.bankAccountNumber ?? existing.bank_account_number,
          bank_account_holder: data.bankAccountHolder ?? existing.bank_account_holder,
          bank_cci: data.bankCci ?? existing.bank_cci,
          cash_enabled: data.cashEnabled ?? existing.cash_enabled,
          updated_at: new Date(),
        },
      });
    }

    return prisma.payment_settings.create({
      data: {
        manager_id: managerId,
        yape_enabled: data.yapeEnabled ?? false,
        yape_phone: data.yapePhone,
        plin_enabled: data.plinEnabled ?? false,
        plin_phone: data.plinPhone,
        bank_transfer_enabled: data.bankTransferEnabled ?? false,
        bank_name: data.bankName,
        bank_account_number: data.bankAccountNumber,
        bank_account_holder: data.bankAccountHolder,
        bank_cci: data.bankCci,
        cash_enabled: data.cashEnabled ?? true,
      },
    });
  }
}
