import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";
import { useAI } from "../contexts/AI.context";
import { mergeArrays } from "../utils/mergeArray";

export const useAIQuery = ({ url, fetchInit = {}, reactQueryOptions }) => {
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

export const useCreateAIBasedSeo = (setAIKeywords) => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  const { setProductSeo } = useAI();
  async function createStatus(status) {
    return await fetch("/api/AI/seo-generation", {
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
      const response = await data.json();
      setProductSeo(response?.aiContent?.result);
      setAIKeywords("");

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

export const useCreateSingleAIBasedSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  const { setProductSeo, productSeo } = useAI();
  async function createStatus(status) {
    return await fetch("/api/AI/single-seo", {
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
      const response = await data.json();

      if (response?.aiResult?.name === "ai_metaTitle_title") {
        let arr = [...productSeo?.metaTitle];
        arr[response?.aiResult?.index] = response?.aiResult?.suggestion;
        let metaSeo = { ...productSeo, metaTitle: arr };
        setProductSeo(metaSeo);
      } else {
        let arr = [...productSeo?.metaDescription];
        arr[response?.aiResult?.index] = response?.aiResult?.suggestion;
        let descSeo = { ...productSeo, metaDescription: arr };
        setProductSeo(descSeo);
      }

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

export const useCreateBulkProductAISeo = (
  formData,
  setFormData,
  setFormUpdatedData
) => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast } = useUI();
  async function createStatus(status) {
    return await fetch(`/api/AI/product-bulk-seo`, {
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
      const aiResult = await mergeArrays(
        formData,
        updatedData?.aiResult?.suggestions
      );
      setFormData(aiResult);
      const updatedFormData = updatedData?.aiResult?.suggestions.map((item) => {
        return {
          id: item.productId,
          title: item.productTitle,
          seo_title: item.metaTitle,
          seo_description: item.metaDescription,
        };
      });
      setFormUpdatedData(updatedFormData);
      // console.log("🚀 ~ onSuccess: ~ updatedData:", aiResult, updatedData);
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
