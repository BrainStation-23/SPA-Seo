import { Page } from "@shopify/polaris";
import SpeedInsights from "../components/SpeedInsights";
// import { SpeedInsights } from "../components";

export default function HomePage() {
  return (
    <Page title="Speed insights" fullWidth>
      <SpeedInsights />
    </Page>
  );
}
