import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useBulkUpdateAltText = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  async function runBulkImageAltTextChange() {
    return await fetch("/api/image-optimizer/alt-text", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation(() => runBulkImageAltTextChange(), {
    onSuccess: async (data) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }

      setToggleToast({
        active: true,
        message: `Bulk image alt text updated successfully`,
      });
    },
    onError: async () => {
      setToggleToast({
        active: true,
        message: `Something went wrong`,
      });
    },
    refetchOnWindowFocus: false,
  });
};

export const useImageOptimizerQuery = ({
  url,
  fetchInit = {},
  reactQueryOptions,
}) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery("ImageOptimizerSettings", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
  });
};

export const useSaveImageOptimizerSettings = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  const queryClient = useQueryClient();
  async function saveImageOptimizerSettings(status) {
    return await fetch("/api/metafields/save/image-optimizer", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => saveImageOptimizerSettings(status), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      queryClient.invalidateQueries("ImageOptimizerSettings");

      setToggleToast({
        active: true,
        message: `Saved Successfully`,
      });
    },
    onError: async () => {
      setToggleToast({
        active: true,
        message: `Something went wrong`,
      });
    },
    refetchOnWindowFocus: false,
  });
};

export const useSingleImageFilenameUpdate = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  // const queryClient = useQueryClient();
  async function saveImageOptimizerSettings(status) {
    return await fetch("/api/image-optimizer/filename", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => saveImageOptimizerSettings(status), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      // queryClient.invalidateQueries("ImageOptimizerSettings");

      setToggleToast({
        active: true,
        message: `Saved Successfully`,
      });
    },
    onError: async () => {
      setToggleToast({
        active: true,
        message: `Something went wrong`,
      });
    },
    refetchOnWindowFocus: false,
  });
};
