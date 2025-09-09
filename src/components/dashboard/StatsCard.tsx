import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon: LucideIcon;
  iconColor?: "primary" | "secondary" | "success" | "warning" | "destructive";
  children?: ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  iconColor = "primary",
  children 
}: StatsCardProps) {
  const getIconBgColor = () => {
    switch (iconColor) {
      case "primary": return "bg-gradient-primary";
      case "secondary": return "bg-gradient-secondary";
      case "success": return "bg-success";
      case "warning": return "bg-warning";
      case "destructive": return "bg-destructive";
      default: return "bg-gradient-primary";
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-success";
      case "negative": return "text-destructive";
      case "warning": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="hover-lift transition-smooth shadow-soft hover:shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {change && (
          <p className={`text-xs ${getChangeColor()}`}>
            {change}
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}