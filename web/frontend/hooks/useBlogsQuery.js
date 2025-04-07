import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUI } from "../contexts/ui.context";

export const useBlogsQuery = ({
  afterCursor,
  beforeCursor,
  limit,
  fetchInit = {},
}) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const url = `/api/blog/list?afterCursor=${afterCursor || ""}&beforeCursor=${
    beforeCursor || ""
  }&limit=${limit}`;
  const { modal } = useUI();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url]);

  return useQuery(["blogList", afterCursor, beforeCursor, limit], fetch, {
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    enabled: !modal?.isOpen,
  });
};

export const useArticlesQuery = ({
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

  return useQuery("articleList", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    // Ensure data is not cached by setting cacheTime to 0
    cacheTime: 0,
    // Make data stale immediately after fetching
    staleTime: 0,
    // enabled: Object.keys(shop).length === 0,
  });
};

export const useSingleArticleQuery = ({
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

  return useQuery("singleArticle", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    cacheTime: 0,
    staleTime: 0,
    // enabled: Object.keys(shop).length === 0,
  });
};

export const useArticlesSeoQuery = ({
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

  return useQuery("articleSeo", fetch, {
    ...reactQueryOptions,
    onSuccess: (data) => {},
    refetchOnWindowFocus: false,
    cacheTime: 0,
    staleTime: 0,
    // enabled: Object.keys(shop).length === 0,
  });
};

export const useUpdateBlogSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch("/api/blog/update-article-seo", {
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

      // queryClient.invalidateQueries("articleSeo");
      const updatedData = await data?.json();
      const updatedInfo = updatedData?.article;

      setOpenModal({
        view: "ARTICLE_SEO",
        isOpen: true,
        data: {
          title: `Article SEO (${updatedInfo?.title})`,
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

export const useUpdateArticleSeoImgAlt = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast, setOpenModal } = useUI();
  const queryClient = useQueryClient();
  async function createStatus(status) {
    return await fetch(`/api/blog/update-article-image-alt`, {
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
      const updatedInfo = updatedData?.articleData;
      setOpenModal({
        view: "ARTICLE_SEO",
        isOpen: true,
        data: {
          title: `Article SEO (${updatedInfo?.title})`,
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

export const useUploadBlogFileSeo = () => {
  const fetch = useAuthenticatedFetch();
  const { setToggleToast, setOpenModal } = useUI();
  async function createStatus(status) {
    return await fetch("/api/blog/upload-blog-file", {
      method: "POST",
      body: status,
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
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
