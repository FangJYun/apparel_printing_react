import { FeaturePage } from "../components/FeaturePage";
import { SiteShell } from "../components/SiteShell";

export default function ProductsPage() {
  return (
    <SiteShell>
      <FeaturePage pageKey="/products" />
    </SiteShell>
  );
}
