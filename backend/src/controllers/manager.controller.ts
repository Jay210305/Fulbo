import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ManagerService } from '../services/manager.service';
import { discount_type } from '@prisma/client';

export class ManagerController {
  // ==================== FIELDS ====================

  /**
   * GET /api/manager/fields
   * List all fields owned by the authenticated manager
   */
  static async getMyFields(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;

      const fields = await ManagerService.getFieldsByOwner(ownerId);

      // Map to frontend-friendly format
      const response = fields.map((field) => ({
        id: field.field_id,
        name: field.name,
        address: field.address,
        description: field.description,
        amenities: field.amenities,
        basePricePerHour: Number(field.base_price_per_hour),
        photos: field.field_photos.map((p) => ({
          id: p.photo_id,
          url: p.image_url,
          isCover: p.is_cover,
        })),
        promotions: field.promotions.map((promo) => ({
          id: promo.promotion_id,
          title: promo.title,
          discountType: promo.discount_type,
          discountValue: Number(promo.discount_value),
          isActive: promo.is_active,
        })),
        stats: {
          bookingsCount: field._count.bookings,
          reviewsCount: field._count.reviews,
        },
        createdAt: field.created_at,
        updatedAt: field.updated_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching manager fields:', error);
      res.status(500).json({ message: 'Error al obtener tus canchas' });
    }
  }

  /**
   * GET /api/manager/fields/:id
   * Get a specific field owned by the authenticated manager
   */
  static async getMyField(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.id;

      const field = await ManagerService.getFieldByOwner(fieldId, ownerId);

      if (!field) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      const response = {
        id: field.field_id,
        name: field.name,
        address: field.address,
        description: field.description,
        amenities: field.amenities,
        basePricePerHour: Number(field.base_price_per_hour),
        photos: field.field_photos.map((p) => ({
          id: p.photo_id,
          url: p.image_url,
          isCover: p.is_cover,
        })),
        promotions: field.promotions.map((promo) => ({
          id: promo.promotion_id,
          title: promo.title,
          description: promo.description,
          discountType: promo.discount_type,
          discountValue: Number(promo.discount_value),
          startDate: promo.start_date,
          endDate: promo.end_date,
          isActive: promo.is_active,
        })),
        stats: {
          bookingsCount: field._count.bookings,
          reviewsCount: field._count.reviews,
        },
        createdAt: field.created_at,
        updatedAt: field.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching manager field:', error);
      res.status(500).json({ message: 'Error al obtener la cancha' });
    }
  }

  /**
   * POST /api/manager/fields
   * Create a new field for the authenticated manager
   */
  static async createField(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { name, address, description, amenities, basePricePerHour } = req.body;

      // Basic validation
      if (!name || !address || basePricePerHour === undefined) {
        return res.status(400).json({
          message: 'Nombre, dirección y precio por hora son obligatorios',
        });
      }

      if (basePricePerHour <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
      }

      const field = await ManagerService.createField(ownerId, {
        name,
        address,
        description,
        amenities,
        basePricePerHour,
      });

      res.status(201).json({
        message: 'Cancha creada exitosamente',
        field: {
          id: field.field_id,
          name: field.name,
          address: field.address,
          description: field.description,
          amenities: field.amenities,
          basePricePerHour: Number(field.base_price_per_hour),
          createdAt: field.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating field:', error);
      res.status(500).json({ message: 'Error al crear la cancha' });
    }
  }

  /**
   * PUT /api/manager/fields/:id
   * Update a field owned by the authenticated manager
   */
  static async updateField(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.id;
      const { name, address, description, amenities, basePricePerHour } = req.body;

      // Validate price if provided
      if (basePricePerHour !== undefined && basePricePerHour <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
      }

      const field = await ManagerService.updateField(fieldId, ownerId, {
        name,
        address,
        description,
        amenities,
        basePricePerHour,
      });

      if (!field) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      res.json({
        message: 'Cancha actualizada exitosamente',
        field: {
          id: field.field_id,
          name: field.name,
          address: field.address,
          description: field.description,
          amenities: field.amenities,
          basePricePerHour: Number(field.base_price_per_hour),
          updatedAt: field.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating field:', error);
      res.status(500).json({ message: 'Error al actualizar la cancha' });
    }
  }

  /**
   * DELETE /api/manager/fields/:id
   * Soft delete a field owned by the authenticated manager
   */
  static async deleteField(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.id;

      const field = await ManagerService.deleteField(fieldId, ownerId);

      if (!field) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      res.json({ message: 'Cancha eliminada exitosamente' });
    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({ message: 'Error al eliminar la cancha' });
    }
  }

  // ==================== PROMOTIONS ====================

  /**
   * GET /api/manager/fields/:fieldId/promotions
   * List all promotions for a field owned by the authenticated manager
   */
  static async getPromotions(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.fieldId;

      const promotions = await ManagerService.getPromotionsByField(fieldId, ownerId);

      if (promotions === null) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      const response = promotions.map((promo) => ({
        id: promo.promotion_id,
        title: promo.title,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: Number(promo.discount_value),
        startDate: promo.start_date,
        endDate: promo.end_date,
        isActive: promo.is_active,
        createdAt: promo.created_at,
        updatedAt: promo.updated_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ message: 'Error al obtener promociones' });
    }
  }

  /**
   * GET /api/manager/promotions/:id
   * Get a specific promotion by ID
   */
  static async getPromotion(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const promotionId = req.params.id;

      const promotion = await ManagerService.getPromotionById(promotionId, ownerId);

      if (!promotion) {
        return res.status(404).json({ message: 'Promoción no encontrada o no tienes permiso' });
      }

      res.json({
        id: promotion.promotion_id,
        fieldId: promotion.field_id,
        fieldName: promotion.fields.name,
        title: promotion.title,
        description: promotion.description,
        discountType: promotion.discount_type,
        discountValue: Number(promotion.discount_value),
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        isActive: promotion.is_active,
        createdAt: promotion.created_at,
        updatedAt: promotion.updated_at,
      });
    } catch (error) {
      console.error('Error fetching promotion:', error);
      res.status(500).json({ message: 'Error al obtener la promoción' });
    }
  }

  /**
   * POST /api/manager/fields/:fieldId/promotions
   * Create a new promotion for a field owned by the authenticated manager
   */
  static async createPromotion(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.fieldId;
      const { title, description, discountType, discountValue, startDate, endDate } = req.body;

      // Validation
      if (!title || !discountType || discountValue === undefined || !startDate || !endDate) {
        return res.status(400).json({
          message: 'Título, tipo de descuento, valor, fecha inicio y fin son obligatorios',
        });
      }

      if (!['percentage', 'fixed_amount'].includes(discountType)) {
        return res.status(400).json({
          message: 'Tipo de descuento debe ser "percentage" o "fixed_amount"',
        });
      }

      if (discountValue <= 0) {
        return res.status(400).json({ message: 'El valor del descuento debe ser mayor a 0' });
      }

      if (discountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({ message: 'El porcentaje no puede ser mayor a 100' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({ message: 'La fecha de fin debe ser posterior a la de inicio' });
      }

      const promotion = await ManagerService.createPromotion(fieldId, ownerId, {
        title,
        description,
        discountType: discountType as discount_type,
        discountValue,
        startDate: start,
        endDate: end,
      });

      if (!promotion) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      res.status(201).json({
        message: 'Promoción creada exitosamente',
        promotion: {
          id: promotion.promotion_id,
          title: promotion.title,
          description: promotion.description,
          discountType: promotion.discount_type,
          discountValue: Number(promotion.discount_value),
          startDate: promotion.start_date,
          endDate: promotion.end_date,
          isActive: promotion.is_active,
          createdAt: promotion.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      res.status(500).json({ message: 'Error al crear la promoción' });
    }
  }

  /**
   * PUT /api/manager/promotions/:id
   * Update a promotion
   */
  static async updatePromotion(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const promotionId = req.params.id;
      const { title, description, discountType, discountValue, startDate, endDate, isActive } = req.body;

      // Validate discount type if provided
      if (discountType && !['percentage', 'fixed_amount'].includes(discountType)) {
        return res.status(400).json({
          message: 'Tipo de descuento debe ser "percentage" o "fixed_amount"',
        });
      }

      // Validate discount value if provided
      if (discountValue !== undefined && discountValue <= 0) {
        return res.status(400).json({ message: 'El valor del descuento debe ser mayor a 0' });
      }

      if (discountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({ message: 'El porcentaje no puede ser mayor a 100' });
      }

      const promotion = await ManagerService.updatePromotion(promotionId, ownerId, {
        title,
        description,
        discountType: discountType as discount_type | undefined,
        discountValue,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      });

      if (!promotion) {
        return res.status(404).json({ message: 'Promoción no encontrada o no tienes permiso' });
      }

      res.json({
        message: 'Promoción actualizada exitosamente',
        promotion: {
          id: promotion.promotion_id,
          title: promotion.title,
          description: promotion.description,
          discountType: promotion.discount_type,
          discountValue: Number(promotion.discount_value),
          startDate: promotion.start_date,
          endDate: promotion.end_date,
          isActive: promotion.is_active,
          updatedAt: promotion.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({ message: 'Error al actualizar la promoción' });
    }
  }

  /**
   * DELETE /api/manager/promotions/:id
   * Soft delete a promotion
   */
  static async deletePromotion(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const promotionId = req.params.id;

      const promotion = await ManagerService.deletePromotion(promotionId, ownerId);

      if (!promotion) {
        return res.status(404).json({ message: 'Promoción no encontrada o no tienes permiso' });
      }

      res.json({ message: 'Promoción eliminada exitosamente' });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      res.status(500).json({ message: 'Error al eliminar la promoción' });
    }
  }

  /**
   * PATCH /api/manager/promotions/:id/deactivate
   * Deactivate a promotion without deleting it
   */
  static async deactivatePromotion(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const promotionId = req.params.id;

      const promotion = await ManagerService.deactivatePromotion(promotionId, ownerId);

      if (!promotion) {
        return res.status(404).json({ message: 'Promoción no encontrada o no tienes permiso' });
      }

      res.json({
        message: 'Promoción desactivada exitosamente',
        promotion: {
          id: promotion.promotion_id,
          isActive: promotion.is_active,
        },
      });
    } catch (error) {
      console.error('Error deactivating promotion:', error);
      res.status(500).json({ message: 'Error al desactivar la promoción' });
    }
  }
}
