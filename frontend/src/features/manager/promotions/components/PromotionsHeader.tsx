import { ArrowLeft } from "lucide-react";

interface PromotionsHeaderProps {
  fieldName: string;
  onBack: () => void;
}

export function PromotionsHeader({ fieldName, onBack }: PromotionsHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
      <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
        <ArrowLeft size={20} />
      </button>
      <div>
        <h2>Promociones</h2>
        <p className="text-sm text-muted-foreground">{fieldName}</p>
      </div>
    </div>
  );
}
