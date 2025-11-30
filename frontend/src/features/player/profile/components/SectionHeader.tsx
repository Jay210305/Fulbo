import { ArrowLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  onBack: () => void;
}

export function SectionHeader({ title, onBack }: SectionHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
      <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
        <ArrowLeft size={20} />
      </button>
      <h2>{title}</h2>
    </div>
  );
}
