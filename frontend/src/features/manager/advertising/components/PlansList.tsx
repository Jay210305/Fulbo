import { Plan } from '../types';
import { PlanCard } from './PlanCard';

interface PlansListProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
}

export function PlansList({ plans, onSelectPlan }: PlansListProps) {
  return (
    <div>
      <h3 className="mb-4">Planes Disponibles</h3>
      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelect={onSelectPlan} />
        ))}
      </div>
    </div>
  );
}
