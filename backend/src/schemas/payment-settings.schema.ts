import { z } from 'zod';

// Helper to transform null to undefined for compatibility with services
const nullToUndefined = <T>(val: T | null | undefined): T | undefined => 
  val === null ? undefined : val;

// ==================== PAYMENT SETTINGS SCHEMA ====================

export const updatePaymentSettingsSchema = z.object({
  yapeEnabled: z.boolean().optional().default(false),
  yapePhone: z
    .string()
    .regex(/^9\d{8}$/, 'Número de Yape inválido (debe empezar con 9 y tener 9 dígitos)')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  plinEnabled: z.boolean().optional().default(false),
  plinPhone: z
    .string()
    .regex(/^9\d{8}$/, 'Número de Plin inválido (debe empezar con 9 y tener 9 dígitos)')
    .optional()
    .nullable()
    .transform(nullToUndefined),
  bankTransferEnabled: z.boolean().optional().default(false),
  bankName: z.string().max(100).optional().nullable().transform(nullToUndefined),
  bankAccountNumber: z.string().max(30).optional().nullable().transform(nullToUndefined),
  bankAccountHolder: z.string().max(200).optional().nullable().transform(nullToUndefined),
  bankCci: z.string().length(20, 'El CCI debe tener 20 dígitos').optional().nullable().transform(nullToUndefined),
  cashEnabled: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  // Conditional validation: if yapeEnabled, yapePhone is required
  if (data.yapeEnabled && !data.yapePhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El número de Yape es requerido si Yape está habilitado',
      path: ['yapePhone'],
    });
  }

  // Conditional validation: if plinEnabled, plinPhone is required
  if (data.plinEnabled && !data.plinPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El número de Plin es requerido si Plin está habilitado',
      path: ['plinPhone'],
    });
  }

  // Conditional validation: if bankTransferEnabled, bank details are required
  if (data.bankTransferEnabled) {
    if (!data.bankName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre del banco es requerido si la transferencia está habilitada',
        path: ['bankName'],
      });
    }
    if (!data.bankAccountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de cuenta es requerido si la transferencia está habilitada',
        path: ['bankAccountNumber'],
      });
    }
    if (!data.bankAccountHolder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El titular de la cuenta es requerido si la transferencia está habilitada',
        path: ['bankAccountHolder'],
      });
    }
  }
});

export type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsSchema>;
