import React, { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useUI } from "../contexts/ui.context";
import { fetchWithProgess } from "../utils/fetchWithProgress";
import useFetchMutation from "../hooks/useGlobalMutation";

export const useSpeedUpWithProgress = () => {
  const [progress, setProgress] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [compleatedTask, setCompleatedTask] = useState(0);
  const { appBilling, speedInsights, setSpeedInsights } = useUI();

  // Agei sorry bole nitesi
  // Ami choto amake marben na
  // ami asolei choto marben na plz
  const fetcher = useAuthenticatedFetch();
  const { mutate } = useFetchMutation(
    "/api/seo/speed-effect",
    "updateSpeedInsights"
  );

  const startTaks = async (queue, count) => {
    setTaskCount(count);
    await fetchWithProgess(queue, fetcher, setProgress, setCompleatedTask);

    // Remove platformStoreURL from speedInsights
    const { platformStoreURL, ...restSpeedInsights } = speedInsights;
    mutate(
      {
        ...restSpeedInsights,
        ...queue,
      },
      {
        onSuccess: () => {
          setSpeedInsights(queue);
        },
      }
    );
  };

  const resetProgress = () => {
    setProgress(0);
    setCompleatedTask(0);
    setTaskCount(0);
  };

  return {
    progress,
    compleatedTask,
    taskCount,
    startTaks,
    resetProgress,
  };
};
