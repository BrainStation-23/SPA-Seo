import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMutation } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useUninstall = () => {
  const fetcher = useAuthenticatedFetch();
  const { setCloseModal, setToggleToast } = useUI();
  async function createStatus() {
    return await fetcher("/api/uninstall", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return useMutation(() => createStatus(), {
    onSuccess: async (data, obj) => {
      if (data?.status === 400) {
        return setToggleToast({
          active: true,
          message: `Something went wrong`,
        });
      }
      setCloseModal();

      setToggleToast({
        active: true,
        message: `Removed everything successfully`,
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
