import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ManagerService } from '../services/manager.service';
import { BusinessProfileService } from '../services/business-profile.service';
import { discount_type, product_category } from '@prisma/client';

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

  // ==================== PRODUCTS ====================

  /**
   * GET /api/manager/fields/:fieldId/products
   * List all products for a field owned by the authenticated manager
   */
  static async getProducts(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.fieldId;

      const products = await ManagerService.getProductsByField(fieldId, ownerId);

      if (products === null) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      const response = products.map((product) => ({
        id: product.product_id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        image: product.image_url,
        category: product.category,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  }

  /**
   * GET /api/manager/products/:id
   * Get a specific product by ID
   */
  static async getProduct(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const productId = req.params.id;

      const product = await ManagerService.getProductById(productId, ownerId);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado o no tienes permiso' });
      }

      res.json({
        id: product.product_id,
        fieldId: product.field_id,
        fieldName: product.fields.name,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        image: product.image_url,
        category: product.category,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error al obtener el producto' });
    }
  }

  /**
   * POST /api/manager/fields/:fieldId/products
   * Create a new product for a field owned by the authenticated manager
   */
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const fieldId = req.params.fieldId;
      const { name, description, price, imageUrl, category } = req.body;

      // Validation
      if (!name || price === undefined || !category) {
        return res.status(400).json({
          message: 'Nombre, precio y categoría son obligatorios',
        });
      }

      const validCategories: product_category[] = ['bebida', 'snack', 'equipo', 'promocion'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          message: 'Categoría debe ser "bebida", "snack", "equipo" o "promocion"',
        });
      }

      if (price <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
      }

      const product = await ManagerService.createProduct(fieldId, ownerId, {
        name,
        description,
        price,
        imageUrl,
        category: category as product_category,
      });

      if (!product) {
        return res.status(404).json({ message: 'Cancha no encontrada o no tienes permiso' });
      }

      res.status(201).json({
        message: 'Producto creado exitosamente',
        product: {
          id: product.product_id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          image: product.image_url,
          category: product.category,
          isActive: product.is_active,
          createdAt: product.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error al crear el producto' });
    }
  }

  /**
   * PUT /api/manager/products/:id
   * Update a product
   */
  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const productId = req.params.id;
      const { name, description, price, imageUrl, category, isActive } = req.body;

      // Validate category if provided
      if (category) {
        const validCategories: product_category[] = ['bebida', 'snack', 'equipo', 'promocion'];
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            message: 'Categoría debe ser "bebida", "snack", "equipo" o "promocion"',
          });
        }
      }

      // Validate price if provided
      if (price !== undefined && price <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
      }

      const product = await ManagerService.updateProduct(productId, ownerId, {
        name,
        description,
        price,
        imageUrl,
        category: category as product_category | undefined,
        isActive,
      });

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado o no tienes permiso' });
      }

      res.json({
        message: 'Producto actualizado exitosamente',
        product: {
          id: product.product_id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          image: product.image_url,
          category: product.category,
          isActive: product.is_active,
          updatedAt: product.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  }

  /**
   * DELETE /api/manager/products/:id
   * Soft delete a product
   */
  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const productId = req.params.id;

      const product = await ManagerService.deleteProduct(productId, ownerId);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado o no tienes permiso' });
      }

      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }

  /**
   * PATCH /api/manager/products/:id/toggle-active
   * Toggle product active status
   */
  static async toggleProductActive(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const productId = req.params.id;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive debe ser un valor booleano' });
      }

      const product = await ManagerService.toggleProductActive(productId, ownerId, isActive);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado o no tienes permiso' });
      }

      res.json({
        message: isActive ? 'Producto activado exitosamente' : 'Producto desactivado exitosamente',
        product: {
          id: product.product_id,
          isActive: product.is_active,
        },
      });
    } catch (error) {
      console.error('Error toggling product active status:', error);
      res.status(500).json({ message: 'Error al cambiar el estado del producto' });
    }
  }

  // ==================== BUSINESS PROFILE ====================

  /**
   * GET /api/manager/profile
   * Get the business profile for the authenticated manager
   */
  static async getBusinessProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;

      const profile = await BusinessProfileService.getByUserId(userId);

      if (!profile) {
        return res.status(404).json({ 
          message: 'Perfil de negocio no encontrado',
          profile: null 
        });
      }

      // Map to frontend-friendly format (camelCase)
      res.json({
        profile: {
          id: profile.profile_id,
          userId: profile.user_id,
          businessName: profile.business_name,
          ruc: profile.ruc,
          address: profile.address,
          phone: profile.phone,
          email: profile.email,
          settings: profile.settings,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      });
    } catch (error) {
      console.error('Error fetching business profile:', error);
      res.status(500).json({ message: 'Error al obtener el perfil de negocio' });
    }
  }

  /**
   * PUT /api/manager/profile
   * Create or update the business profile for the authenticated manager
   */
  static async updateBusinessProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { businessName, ruc, address, phone, email, settings } = req.body;

      // Check if this is a new profile (create) or existing (update)
      const existingProfile = await BusinessProfileService.getByUserId(userId);

      // Validate required fields for new profiles
      if (!existingProfile) {
        if (!businessName || !ruc) {
          return res.status(400).json({ 
            message: 'El nombre del negocio (Razón Social) y RUC son obligatorios para crear el perfil' 
          });
        }
      }

      // Validate RUC uniqueness if provided
      if (ruc) {
        const rucTaken = await BusinessProfileService.isRucTaken(ruc, userId);
        if (rucTaken) {
          return res.status(400).json({ message: 'El RUC ya está registrado por otro usuario' });
        }
      }

      // Upsert the profile
      const profile = await BusinessProfileService.upsert(userId, {
        businessName,
        ruc,
        address,
        phone,
        email,
        settings,
      });

      res.json({
        message: existingProfile 
          ? 'Perfil de negocio actualizado exitosamente' 
          : 'Perfil de negocio creado exitosamente',
        profile: {
          id: profile!.profile_id,
          userId: profile!.user_id,
          businessName: profile!.business_name,
          ruc: profile!.ruc,
          address: profile!.address,
          phone: profile!.phone,
          email: profile!.email,
          settings: profile!.settings,
          createdAt: profile!.created_at,
          updatedAt: profile!.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating business profile:', error);
      res.status(500).json({ message: 'Error al actualizar el perfil de negocio' });
    }
  }

  // ==================== BOOKINGS ====================

  /**
   * GET /api/manager/bookings
   * List all bookings for manager's fields with optional filters
   */
  static async getBookings(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { startDate, endDate, fieldId, status } = req.query;

      const filters: {
        startDate?: Date;
        endDate?: Date;
        fieldId?: string;
        status?: 'pending' | 'confirmed' | 'cancelled';
      } = {};

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      if (fieldId) {
        filters.fieldId = fieldId as string;
      }
      if (status && ['pending', 'confirmed', 'cancelled'].includes(status as string)) {
        filters.status = status as 'pending' | 'confirmed' | 'cancelled';
      }

      const bookings = await ManagerService.getBookingsByOwner(ownerId, filters);

      // Map to frontend-friendly format
      const response = bookings.map((booking) => ({
        id: booking.booking_id,
        fieldId: booking.field_id,
        fieldName: booking.fields.name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        totalPrice: Number(booking.total_price),
        status: booking.status,
        customer: booking.users ? {
          id: booking.users.user_id,
          name: `${booking.users.first_name} ${booking.users.last_name}`,
          email: booking.users.email,
          phone: booking.users.phone_number,
        } : null,
        paymentStatus: booking.payments.length > 0 
          ? booking.payments[0].status 
          : 'pending',
        createdAt: booking.created_at,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching manager bookings:', error);
      res.status(500).json({ message: 'Error al obtener las reservas' });
    }
  }

  // ==================== STATS ====================

  /**
   * GET /api/manager/stats
   * Get dashboard statistics for the manager
   */
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { period = 'today' } = req.query;

      const validPeriods = ['today', 'week', 'month', 'all'];
      const selectedPeriod = validPeriods.includes(period as string) 
        ? (period as 'today' | 'week' | 'month' | 'all')
        : 'today';

      const stats = await ManagerService.getStats(ownerId, selectedPeriod);

      res.json(stats);
    } catch (error) {
      console.error('Error fetching manager stats:', error);
      res.status(500).json({ message: 'Error al obtener las estadísticas' });
    }
  }

  /**
   * GET /api/manager/stats/chart
   * Get revenue chart data for the manager
   */
  static async getChartData(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user.id;
      const { days = '7' } = req.query;

      const numDays = Math.min(Math.max(parseInt(days as string) || 7, 1), 30);

      const chartData = await ManagerService.getRevenueChartData(ownerId, numDays);

      res.json(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ message: 'Error al obtener datos del gráfico' });
    }
  }
}
