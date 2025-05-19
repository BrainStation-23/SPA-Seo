import React, { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useUI } from "../contexts/ui.context";
import useFetchQuery from "./useGlobalQuery";
import useFetchMutation from "../hooks/useGlobalMutation";

export const useFeatureToggle = () => {
  const { appBilling, speedInsights, setSpeedInsights } = useUI();

  const { mutate } = useFetchMutation(
    "/api/seo/speed-effect",
    "updateSpeedInsights"
  );

  const toogleFeature = async (feature) => {
    // Additional api call to remove the feature from backend

    // Remove platformStoreURL from speedInsights
    setSpeedInsights(feature);
    const revertToggle = Object.fromEntries(
      Object.entries(feature).map(([key, value]) => [key, !value])
    );
    const { platformStoreURL, ...restSpeedInsights } = speedInsights;
    mutate(
      {
        ...restSpeedInsights,
        ...feature,
      },
      {
        onSuccess: () => {
          setSpeedInsights(feature);
        },
        onError: () => {
          setSpeedInsights(revertToggle);
        },
      }
    );
  };

  return {
    toogleFeature,
  };
};
