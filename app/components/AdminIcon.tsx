import {
  Archive,
  BarChart3,
  Castle,
  ChevronRight,
  Images,
  LayoutDashboard,
  Library,
  PackageCheck,
  PenTool,
  Sparkles,
  TrendingUp,
  Video
} from "lucide-react";

const adminIcons = {
  archive: Archive,
  analysis: BarChart3,
  brand: Castle,
  dashboard: LayoutDashboard,
  delivery: PackageCheck,
  generate: Sparkles,
  library: Library,
  pattern: PenTool,
  productImage: Images,
  trend: TrendingUp,
  video: Video
} as const;

export type AdminIconKey = keyof typeof adminIcons;

export function AdminIcon({ iconKey, size = 20 }: { iconKey?: string; size?: number }) {
  const Icon = adminIcons[(iconKey || "dashboard") as AdminIconKey] || LayoutDashboard;
  return <Icon aria-hidden="true" size={size} strokeWidth={2.2} />;
}

export function MenuChevron() {
  return <ChevronRight aria-hidden="true" size={22} strokeWidth={2.5} />;
}
