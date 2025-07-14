import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useQuery } from "react-query";

export const useFilesQuery = ({
  limit,
  afterCursor,
  beforeCursor,
  resourceType,
  fetchInit = {},
}) => {
  const url = `/api/files/list?afterCursor=${afterCursor || ""}&beforeCursor=${
    beforeCursor || ""
  }&limit=${limit}`;
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, ["fileList", afterCursor, beforeCursor, limit, resourceType]);

  return useQuery(
    ["fileList", afterCursor, beforeCursor, limit, resourceType],
    fetch,
    {
      onSuccess: (data) => {
        console.log("in useFileQuery", data);
      },
      refetchOnWindowFocus: false,
      enabled: resourceType === "file",
    }
  );
};
