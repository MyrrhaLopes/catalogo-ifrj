import { Search } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";

type AdminSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function AdminSearchInput({ value, onChange, placeholder, className }: AdminSearchInputProps) {
  return (
    <div className={className ?? "relative max-w-sm"}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
