import { prisma } from '../config/prisma';
import { discount_type, product_category } from '@prisma/client';

// --- DTOs ---
interface CreateFieldDto {
  name: string;
  address: string;
  description?: string;
  amenities?: Record<string, any>;
  basePricePerHour: number;
}

interface UpdateFieldDto {
  name?: string;
  address?: string;
  description?: string;
  amenities?: Record<string, any>;
  basePricePerHour?: number;
}

interface CreatePromotionDto {
  title: string;
  description?: string;
  discountType: discount_type;
  discountValue: number;
  startDate: Date;
  endDate: Date;
}

interface UpdatePromotionDto {
  title?: string;
  description?: string;
  discountType?: discount_type;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: product_category;
}

interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: product_category;
  isActive?: boolean;
}

export class ManagerService {
  // ==================== FIELDS ====================

  /**
   * List all fields owned by the manager (excluding soft-deleted)
   */
  static async getFieldsByOwner(ownerId: string) {
    return prisma.fields.findMany({
      where: {
        owner_id: ownerId,
        deleted_at: null,
      },
      include: {
        field_photos: true,
        promotions: {
          where: { deleted_at: null },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a specific field by ID (only if owned by the manager)
   */
  static async getFieldByOwner(fieldId: string, ownerId: string) {
    return prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
      include: {
        field_photos: true,
        promotions: {
          where: { deleted_at: null },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });
  }

  /**
   * Create a new field for the manager
   */
  static async createField(ownerId: string, data: CreateFieldDto) {
    return prisma.fields.create({
      data: {
        owner_id: ownerId,
        name: data.name,
        address: data.address,
        description: data.description,
        amenities: data.amenities || {},
        base_price_per_hour: data.basePricePerHour,
      },
      include: {
        field_photos: true,
      },
    });
  }

  /**
   * Update a field (only if owned by the manager)
   */
  static async updateField(fieldId: string, ownerId: string, data: UpdateFieldDto) {
    // First verify ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.fields.update({
      where: { field_id: fieldId },
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        amenities: data.amenities,
        base_price_per_hour: data.basePricePerHour,
        updated_at: new Date(),
      },
      include: {
        field_photos: true,
        promotions: {
          where: { deleted_at: null },
        },
      },
    });
  }

  /**
   * Soft delete a field (only if owned by the manager)
   */
  static async deleteField(fieldId: string, ownerId: string) {
    // First verify ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    // Soft delete
    return prisma.fields.update({
      where: { field_id: fieldId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ==================== PROMOTIONS ====================

  /**
   * Get all promotions for a field (only if owned by the manager)
   */
  static async getPromotionsByField(fieldId: string, ownerId: string) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.promotions.findMany({
      where: {
        field_id: fieldId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a specific promotion (only if the field is owned by the manager)
   */
  static async getPromotionById(promotionId: string, ownerId: string) {
    return prisma.promotions.findFirst({
      where: {
        promotion_id: promotionId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });
  }

  /**
   * Create a promotion for a field (only if owned by the manager)
   */
  static async createPromotion(fieldId: string, ownerId: string, data: CreatePromotionDto) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.promotions.create({
      data: {
        field_id: fieldId,
        title: data.title,
        description: data.description,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: data.startDate,
        end_date: data.endDate,
      },
    });
  }

  /**
   * Update a promotion (only if the field is owned by the manager)
   */
  static async updatePromotion(promotionId: string, ownerId: string, data: UpdatePromotionDto) {
    // Verify ownership through field relation
    const promotion = await prisma.promotions.findFirst({
      where: {
        promotion_id: promotionId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!promotion) {
      return null;
    }

    return prisma.promotions.update({
      where: { promotion_id: promotionId },
      data: {
        title: data.title,
        description: data.description,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Soft delete a promotion (only if the field is owned by the manager)
   */
  static async deletePromotion(promotionId: string, ownerId: string) {
    // Verify ownership through field relation
    const promotion = await prisma.promotions.findFirst({
      where: {
        promotion_id: promotionId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!promotion) {
      return null;
    }

    // Soft delete
    return prisma.promotions.update({
      where: { promotion_id: promotionId },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deactivate a promotion (keep it but set is_active to false)
   */
  static async deactivatePromotion(promotionId: string, ownerId: string) {
    // Verify ownership through field relation
    const promotion = await prisma.promotions.findFirst({
      where: {
        promotion_id: promotionId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!promotion) {
      return null;
    }

    return prisma.promotions.update({
      where: { promotion_id: promotionId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }

  // ==================== PRODUCTS ====================

  /**
   * Get all products for a field (only if owned by the manager)
   */
  static async getProductsByField(fieldId: string, ownerId: string) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.products.findMany({
      where: {
        field_id: fieldId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a specific product (only if the field is owned by the manager)
   */
  static async getProductById(productId: string, ownerId: string) {
    return prisma.products.findFirst({
      where: {
        product_id: productId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
      include: {
        fields: {
          select: { field_id: true, name: true },
        },
      },
    });
  }

  /**
   * Create a product for a field (only if owned by the manager)
   */
  static async createProduct(fieldId: string, ownerId: string, data: CreateProductDto) {
    // First verify field ownership
    const field = await prisma.fields.findFirst({
      where: {
        field_id: fieldId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!field) {
      return null;
    }

    return prisma.products.create({
      data: {
        field_id: fieldId,
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.imageUrl,
        category: data.category,
      },
    });
  }

  /**
   * Update a product (only if the field is owned by the manager)
   */
  static async updateProduct(productId: string, ownerId: string, data: UpdateProductDto) {
    // Verify ownership through field relation
    const product = await prisma.products.findFirst({
      where: {
        product_id: productId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!product) {
      return null;
    }

    return prisma.products.update({
      where: { product_id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.imageUrl,
        category: data.category,
        is_active: data.isActive,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Soft delete a product (only if the field is owned by the manager)
   */
  static async deleteProduct(productId: string, ownerId: string) {
    // Verify ownership through field relation
    const product = await prisma.products.findFirst({
      where: {
        product_id: productId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!product) {
      return null;
    }

    // Soft delete
    return prisma.products.update({
      where: { product_id: productId },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Toggle product active status (activate/deactivate)
   */
  static async toggleProductActive(productId: string, ownerId: string, isActive: boolean) {
    // Verify ownership through field relation
    const product = await prisma.products.findFirst({
      where: {
        product_id: productId,
        deleted_at: null,
        fields: {
          owner_id: ownerId,
          deleted_at: null,
        },
      },
    });

    if (!product) {
      return null;
    }

    return prisma.products.update({
      where: { product_id: productId },
      data: {
        is_active: isActive,
        updated_at: new Date(),
      },
    });
  }
}
