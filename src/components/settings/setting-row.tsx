import type { LucideIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3.5", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0 mt-0.5">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
