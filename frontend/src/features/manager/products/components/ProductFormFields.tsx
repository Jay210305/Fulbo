import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { ImageUpload } from "../../../../components/shared/ImageUpload";
import type { ProductForm, ProductCategory } from "../types";

interface ProductFormFieldsProps {
  product: ProductForm;
  onChange: (product: ProductForm) => void;
}

export function ProductFormFields({ product, onChange }: ProductFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="productName">Nombre del Producto *</Label>
        <Input
          id="productName"
          placeholder="Ej: Gatorade"
          className="h-12"
          value={product.name}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="productDescription">Descripción</Label>
        <Textarea
          id="productDescription"
          placeholder="Ej: Bebida isotónica 500ml"
          className="min-h-20"
          value={product.description}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="productCategory">Categoría *</Label>
        <select
          id="productCategory"
          className="w-full h-12 px-3 border border-input rounded-md bg-background"
          value={product.category}
          onChange={(e) => onChange({ ...product, category: e.target.value as ProductCategory })}
        >
          <option value="bebida">Bebida</option>
          <option value="snack">Snack</option>
          <option value="equipo">Equipo</option>
          <option value="promocion">Promoción</option>
        </select>
      </div>

      <div>
        <Label htmlFor="productPrice">Precio (S/) *</Label>
        <Input
          id="productPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="5.00"
          className="h-12"
          value={product.price}
          onChange={(e) => onChange({ ...product, price: e.target.value })}
        />
      </div>

      <div>
        <Label>Imagen del Producto</Label>
        <div className="mt-2">
          <ImageUpload
            value={product.imageUrl}
            onChange={(url) => onChange({ ...product, imageUrl: url })}
            folder="products"
            placeholder="Sube una imagen del producto"
          />
        </div>
      </div>
    </div>
  );
}
