import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";
import { useHomeSeo } from "../contexts/home.context";

export const useMetafieldsQuery = ({ url, fetchInit = {}, reactQueryOptions }) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const { organization, setOrganization } = useHomeSeo();
  const { setOpenModal } = useUI();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [JSON.stringify(fetchInit)]);

  return useQuery("metafieldList", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {
      console.log("org data", data);
      if (typeof data.data === "object" && Object.entries(data.data).length > 0) {
        const industry = data.data.organization?.industry?.split(",");
        setOrganization({
          ...organization,
          ...data.data.organization,
          industry: industry,
        });
      }
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateMetafield = (invalidationTarget) => {
  const fetch = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch("/api/metafields/create", {
      method: "POST",
      body: JSON.stringify(status),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation((status) => createStatus(status), {
    onSuccess: async (data, obj) => {
      if (data?.status !== 200) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      if (invalidationTarget === "metafieldList") {
        setCloseModal();
        queryClient.invalidateQueries(invalidationTarget);
      } else {
        const updatedData = await data?.json();
        const owner = updatedData?.owner;
        const updatedInfo = updatedData?.dataByID;
        console.log("updatedInfo", updatedInfo);
        console.log("owner", owner?.toLowerCase());
        if (owner?.toLowerCase() == "product") {
          setOpenModal({
            view: "CREATE_PRODUCT_SEO",
            isOpen: true,
            data: {
              title: `Product SEO (${updatedInfo?.title})`,
              info: updatedInfo,
            },
          });
        }
        if (owner?.toLowerCase() == "collection") {
          setOpenModal({
            view: "CREATE_COLLECTION_SEO",
            isOpen: true,
            data: {
              title: `Collection SEO (${updatedInfo?.title})`,
              info: updatedInfo,
            },
          });
        }
        if (owner?.toLowerCase() == "article") {
          setOpenModal({
            view: "ARTICLE_SEO",
            isOpen: true,
            data: {
              title: `Article SEO (${updatedInfo?.title})`,
              info: updatedInfo,
            },
          });
        }
      }

      setToggleToast({
        active: true,
        message: `Submitted successfully`,
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
