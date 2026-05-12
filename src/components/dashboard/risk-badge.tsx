import { Badge } from "@/components/ui/badge";

type RiskBadgeProps = {
  level: "LOW" | "MEDIUM" | "HIGH";
};

export function RiskBadge({ level }: RiskBadgeProps) {
  if (level === "LOW") {
    return <Badge variant="success">Low</Badge>;
  }
  if (level === "MEDIUM") {
    return <Badge variant="warning">Medium</Badge>;
  }
  return <Badge variant="danger">High</Badge>;
}
