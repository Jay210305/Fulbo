import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Plan } from '../types';

interface RenewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  onRenew: () => void;
}

export function RenewCampaignModal({ open, onOpenChange, plans, onRenew }: RenewCampaignModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renovar Campaña</DialogTitle>
          <DialogDescription>
            Renueva tu campaña actual con el mismo plan o elige uno nuevo
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Plan Actual</p>
            <p className="mb-1">Impulso Semanal</p>
            <p className="text-2xl text-[#047857]">S/ 120</p>
          </div>

          <div className="space-y-2">
            <Label>O elige un nuevo plan</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - S/ {plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onRenew} className="bg-[#047857] hover:bg-[#047857]/90">
            Renovar con Mismo Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
