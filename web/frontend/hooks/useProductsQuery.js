import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useProductsQuery = ({
  url,
  fetchInit = {},
  reactQueryOptions,
}) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const { modal } = useUI();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery("productList", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    enabled: !modal?.isOpen,
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

export const useCreateProductSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleAIButton, setToggleToast, setOpenModal } = useUI();
  async function createStatus(status) {
    return await fetch("/api/product/update-product-seo", {
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
      const updatedInfo = updatedData?.productByID;

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

export const useUpdateProductSeoImgAlt = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch(`/api/product/update-image-alt`, {
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

      const updatedData = await data.json();
      const updatedInfo = updatedData?.productByID;
      console.log("updatedInfo", updatedInfo);

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

export const useProductUpdateBulkSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch("/api/product/update-product-bulk-seo", {
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
      console.log("ggs ggs ggs");
      queryClient.invalidateQueries("productList");

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
