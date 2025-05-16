import { Page } from "@shopify/polaris";
import useFetchQuery from "../hooks/useGlobalQuery";
import SpeedInsights from "../components/SpeedInsights";

export default function HomePage() {
  useFetchQuery({
    apiEndpoint: "/api/billing/get-store-info",
    apiKey: "getActiveSubscription",
    dependency: [],
  });

  return (
    <Page title="Speed insights" fullWidth>
      <SpeedInsights />
    </Page>
  );
}
