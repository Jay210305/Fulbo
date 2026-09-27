import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

interface ProductRow {
  id: string;
  fieldId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  field?: { id: string; name: string; ownerId: string };
}

function serializeProduct(product: ProductRow) {
  return {
    id: product.id,
    fieldId: product.fieldId,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    imageUrl: product.image,
    category: product.category,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    ...(product.field
      ? { fieldId: product.field.id, fieldName: product.field.name }
      : {}),
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertFieldOwnership(userId: string, fieldId: string) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    if (field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return field;
  }

  async listFieldProducts(userId: string, fieldId: string) {
    await this.assertFieldOwnership(userId, fieldId);
    const products = await this.prisma.product.findMany({
      where: { fieldId },
      orderBy: { createdAt: 'asc' },
    });
    return products.map((p) => serializeProduct(p));
  }

  async createFieldProduct(userId: string, fieldId: string, dto: CreateProductDto) {
    await this.assertFieldOwnership(userId, fieldId);
    const product = await this.prisma.product.create({
      data: {
        fieldId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.imageUrl,
        category: dto.category,
      },
    });
    return { message: 'Product created', product: serializeProduct(product) };
  }

  async getProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { field: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    return serializeProduct(product);
  }

  async updateProduct(userId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { field: { select: { id: true, ownerId: true } } },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const { imageUrl, ...rest } = dto;
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { ...rest, ...(imageUrl !== undefined ? { image: imageUrl } : {}) },
    });
    return { message: 'Product updated', product: serializeProduct(updated) };
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { field: { select: { ownerId: true } } },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    await this.prisma.product.delete({ where: { id: productId } });
    return { message: 'Product deleted' };
  }

  async toggleProductActive(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { field: { select: { ownerId: true } } },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.field.ownerId !== userId) {
      throw new ForbiddenException('You do not own this field');
    }
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    });
    return { message: 'Product updated', product: { id: updated.id, isActive: updated.isActive } };
  }
}
