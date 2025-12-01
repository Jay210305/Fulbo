import { Request, Response } from 'express';
import { FieldService } from '../services/field.service';
import { SearchQueryInput, AvailabilityQueryInput } from '../schemas/field.schema';

export class FieldController {
  static async getFields(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query as unknown as SearchQueryInput;

      // Si recibimos lat/lng, buscamos por cercanía
      if (lat !== undefined && lng !== undefined) {
        const nearbyFields = await FieldService.getNearbyFields(lat, lng);

        // Mapeo para el frontend
        const response = nearbyFields.map((f: any) => ({
            id: f.field_id,
            name: f.name,
            location: f.address,
            distance: `${(f.distance_meters / 1000).toFixed(1)} km`,
            price: Number(f.base_price_per_hour),
            image: f.image,
            available: 5, // Mock
            total: 10,    // Mock
            type: '7v7',  // Mock
            rating: 4.8   // Mock
        }));

        res.json(response);
        return;
      }

      const fields = await FieldService.getAllFields();
      
      const formattedFields = fields.map(f => ({
        id: f.field_id,
        name: f.name,
        location: f.address,
        price: Number(f.base_price_per_hour),
        image: f.field_photos[0]?.image_url || 'https://via.placeholder.com/400',
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

  /**
   * GET /api/fields/:id/availability
   * Get availability for a field within a date range
   */
  static async getFieldAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query as unknown as AvailabilityQueryInput;

      // Verify field exists
      const field = await FieldService.getFieldById(id);
      if (!field) {
        return res.status(404).json({ message: 'Cancha no encontrada' });
      }

      const availability = await FieldService.getFieldAvailability(id, startDate, endDate);

      // Combine bookings and blocks into unavailable slots
      const unavailableSlots = [
        ...availability.bookings.map(b => ({
          id: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          type: 'booking',
          reason: null,
        })),
        ...availability.blocks.map(b => ({
          id: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          type: 'block',
          reason: b.reason,
        })),
      ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      res.json({
        fieldId: id,
        fieldName: field.name,
        startDate,
        endDate,
        unavailableSlots,
      });
    } catch (error) {
      console.error('Error fetching field availability:', error);
      res.status(500).json({ message: 'Error al obtener disponibilidad' });
    }
  }
}