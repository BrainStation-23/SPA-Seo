import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { useUI } from "../contexts/ui.context";

const useFetchQuery = ({ apiEndpoint, apiKey, dependency, fetchInit = {} }) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const { setStoreInfo } = useUI();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(apiEndpoint, fetchInit);
      return response.json();
    };
  }, [apiEndpoint]);

  return useQuery([apiKey, apiEndpoint, ...dependency], fetch, {
    onSuccess: (data) => {
      if (
        apiEndpoint === "/api/billing/get-store-info" &&
        data?.activeSubscription
      ) {
        setStoreInfo({
          billing: data?.activeSubscription,
          speedInsights: data?.speedInsights || "HI",
        });
      }
    },
    refetchOnWindowFocus: false,
  });
};

export default useFetchQuery;
