import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useJsonldQuery = () => {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch("/api/jsonld/create-snippets");
      return response.json();
    };
  }, []);

  return useQuery("JsonldSnippets", fetch, {
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    // enabled: Object.keys(shop).length === 0,
  });
};
