interface MatchInfoCardProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
}

export function MatchInfoCard({ matchName, fieldName, date, time }: MatchInfoCardProps) {
  return (
    <div className="bg-secondary border border-[#047857] rounded-xl p-4">
      <h3 className="mb-2">{matchName}</h3>
      <p className="text-sm text-muted-foreground">{fieldName}</p>
      <p className="text-sm text-muted-foreground">{date} • {time}</p>
    </div>
  );
}
