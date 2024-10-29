import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useCollectionsQuery = ({ url, fetchInit = {}, reactQueryOptions }) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery("collectionList", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    // enabled: Object.keys(shop).length === 0,
  });
};

export const useProductsQueryByID = ({ url, id }) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, {});
      return response.json();
    };
  }, [url]);

  return useQuery(url, fetch, {
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    enabled: id !== null,
  });
};

export const useCreateCollectionSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch("/api/collection/update-collection-seo", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => createStatus(status), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      // console.log("data", await data.json());
      const updatedInfo = await data.json();
      const updateData = updatedInfo?.collectionByID;
      // setCloseModal();
      // queryClient.invalidateQueries("collectionList");
      console.log("updateData", updateData);
      setOpenModal({
        view: "CREATE_COLLECTION_SEO",
        isOpen: true,
        data: {
          title: `Collection SEO (${updateData?.title})`,
          info: updateData,
        },
      });

      setToggleToast({
        active: true,
        message: `Submit Successfully`,
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

export const useUpdateCollectionSeoImgAlt = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch(`/api/collection/update-collection-seo-alt-text`, {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => createStatus(status), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      // setCloseModal();
      // queryClient.invalidateQueries("collectionList");
      const updatedData = await data?.json();
      const updatedInfo = updatedData?.collectionByID;
      console.log("updatedInfo", updatedInfo);
      setOpenModal({
        view: "CREATE_COLLECTION_SEO",
        isOpen: true,
        data: {
          title: `Collection SEO (${updatedInfo?.title})`,
          info: updatedInfo,
        },
      });

      setToggleToast({
        active: true,
        message: `Submit Successfully`,
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

export const useCollectionUpdateBulkSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch("/api/collection/update-bulk-collection-seo", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => createStatus(status), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      setCloseModal();
      queryClient.invalidateQueries("collectionList");

      setToggleToast({
        active: true,
        message: `Submit Successfully`,
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
