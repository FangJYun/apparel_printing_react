import { FeaturePage } from "../components/FeaturePage";
import { SiteShell } from "../components/SiteShell";

export default function HelpPage() {
  return (
    <SiteShell>
      <FeaturePage pageKey="/help" />
    </SiteShell>
  );
}
