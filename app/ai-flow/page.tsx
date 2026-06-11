import { FeaturePage } from "../components/FeaturePage";
import { PipelineSection } from "../components/PipelineSection";
import { SiteShell } from "../components/SiteShell";

export default function AiFlowPage() {
  return (
    <SiteShell>
      <FeaturePage pageKey="/ai-flow" />
      <PipelineSection />
    </SiteShell>
  );
}
