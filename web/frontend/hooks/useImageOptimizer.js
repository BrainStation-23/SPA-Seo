import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useBulkUpdateAltText = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  async function runBulkImageAltTextChange(status) {
    return await fetch("/api/image-optimizer/alt-text", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => runBulkImageAltTextChange(status), {
    onSuccess: async (data) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      queryClient.invalidateQueries("ImageOptimizerSettings");

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
  const { setToggleToast, setCloseModal } = useUI();
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
  const { setToggleToast, setOpenModal } = useUI();

  async function updateSingleImageFilename(status) {
    return await fetch("/api/image-optimizer/filename", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => updateSingleImageFilename(status), {
    onSuccess: async (data) => {
      if (data?.status === 400) {
        const response = await data.json();
        return setToggleToast({
          active: true,
          message: response?.message || `Something went wrong`,
        });
      }

      const updataedData = await data.json();
      const updatedInfo = updataedData.productDataById;

      setOpenModal({
        view: "CREATE_PRODUCT_SEO",
        isOpen: true,
        data: {
          title: `Product SEO (${updatedInfo?.title})`,
          info: updatedInfo,
        },
      });
      setToggleToast({
        active: true,
        message: `Updated Successfully`,
      });

      // setCloseModal();
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

export const useBulkImageFilenameUpdate = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast } = useUI();
  const queryClient = useQueryClient();
  async function bulkUpdateImagefilename(status) {
    return await fetch("/api/image-optimizer/filename/all", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => bulkUpdateImagefilename(status), {
    onSuccess: async (data) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      queryClient.invalidateQueries("ImageOptimizerSettings");

      setToggleToast({
        active: true,
        message: `Updated Successfully`,
      });

      setCloseModal();
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
