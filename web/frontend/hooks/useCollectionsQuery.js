import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useCollectionsQuery = ({
  afterCursor,
  beforeCursor,
  limit,
  fetchInit = {},
}) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const url = `/api/collection/list?afterCursor=${
    afterCursor || ""
  }&beforeCursor=${beforeCursor || ""}&limit=${limit}`;
  const { modal } = useUI();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url]);

  return useQuery(["collectionList", afterCursor, beforeCursor], fetch, {
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    enabled: !modal?.isOpen,
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
  const { setToggleToast, setOpenModal, setToggleAIButton } = useUI();
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
      const updatedInfo = await data.json();
      const updateData = updatedInfo?.collectionByID;
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
      setTimeout(() => setToggleAIButton({ active: false, data: null }), 500);
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

      const updatedData = await data?.json();
      const updatedInfo = updatedData?.collectionByID;
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
