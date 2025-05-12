import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMutation, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

const useCreate = (apiEndpoint, apiKey) => {
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();
  const { setToggleToast } = useUI();
  async function createStatus(status) {
    return await fetch(apiEndpoint, {
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
        const error = await data?.json();
        return setToggleToast({
          active: true,
          message:
            error?.error?.message || error?.errors || `Something went wrong`,
        });
      }
      queryClient.invalidateQueries(apiKey);

      setToggleToast({
        active: true,
        message: `Submit Successfully`,
      });
    },
    onError: async (errors) => {
      const error = await errors?.json();
      return setToggleToast({
        active: true,
        message: error?.error?.message || `Something went wrong`,
      });
    },
    refetchOnWindowFocus: false,
  });
};

export default useCreate;
