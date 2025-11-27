import { Request, Response } from 'express';
import { FieldService } from '../services/field.service';

export class FieldController {
  static async getFields(req: Request, res: Response) {
    try {
      const fields = await FieldService.getAllFields();
      
      // Mapeamos los datos para que coincidan con lo que espera el Frontend
      // El frontend espera 'price', 'image', etc.
      const formattedFields = fields.map(f => ({
        id: f.field_id,
        name: f.name,
        location: f.address, // Mapeamos address a location
        price: Number(f.base_price_per_hour),
        image: f.field_photos[0]?.image_url || 'https://via.placeholder.com/400', // Fallback
        // Datos mockeados que calcularemos en Fase 2
        available: 5, 
        total: 10,
        type: '5v5', 
        rating: 4.5,
        hasFullVaso: false
      }));

      res.json(formattedFields);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener canchas' });
    }
  }

  static async getFieldDetail(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const field = await FieldService.getFieldById(id);
        if(!field) {
            res.status(404).json({ message: 'Cancha no encontrada'});
            return;
        }
        res.json(field);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener detalle'});
    }
  }
}