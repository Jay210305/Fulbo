import { TrendingUp, Check } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <div
      className={`rounded-xl p-5 border-2 relative ${
        plan.popular ? 'border-[#047857] bg-secondary' : 'border-border bg-white'
      }`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-4 bg-[#047857] hover:bg-[#047857]/90 text-white border-none">
          <TrendingUp size={12} className="mr-1" />
          Más Popular
        </Badge>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="mb-1">{plan.name}</h4>
          <p className="text-sm text-muted-foreground">{plan.duration}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl text-[#047857]">S/ {plan.price}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {plan.benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <Check size={16} className="text-[#047857] mt-0.5 flex-shrink-0" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <Button
        className={`w-full ${
          plan.popular
            ? 'bg-[#047857] hover:bg-[#047857]/90'
            : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
        onClick={() => onSelect(plan)}
      >
        Comprar Plan
      </Button>
    </div>
  );
}
