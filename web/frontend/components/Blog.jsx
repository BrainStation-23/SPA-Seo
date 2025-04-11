import React, { useEffect } from "react";
import {
  IndexTable,
  Text,
  HorizontalStack,
  VerticalStack,
  Button,
  SkeletonBodyText,
} from "@shopify/polaris";
import { IndexTableData } from "./commonUI/IndexTable";
import { useUI } from "../contexts/ui.context";
import { useBlogsQuery } from "../hooks/useBlogsQuery";
import { useSearchParams } from "react-router-dom";

export default function BlogPage() {
  const { setOpenModal } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract `after` and `before` from URL
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");
  const { isError, isLoading, data } = useBlogsQuery({
    afterCursor,
    beforeCursor,
    limit: 10,
  });

  useEffect(() => {
    return () => {
      // Clear URL search parameters on unmount
      setSearchParams({});
    };
  }, []);

  const rowMarkup =
    (data &&
      data?.blogs?.map((info, index) => (
        <IndexTable.Row id={info?.id} key={info?.id} position={index}>
          <IndexTable.Cell>
            <Text as="span">{info?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.tags}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <HorizontalStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "BLOG_SEO",
                    isOpen: true,
                    data: {
                      title: `Blog (${info?.title})`,
                      info: info,
                    },
                  });
                }}
              >
                Articles
              </Button>
            </HorizontalStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))) ||
    [];

  const headings = [
    { title: "Name" },
    { title: "Tags" },
    { title: "Action", alignment: "center" },
  ];

  const resourceName = {
    singular: "Product",
    plural: "Products",
  };

  return (
    <>
      <VerticalStack gap="2">
        <div className="seo_score_page_title_container">
          <div className="seo_score_page_title">Blog SEO</div>
          <Button
            className="cursor_pointer"
            primary
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              setOpenModal({
                view: "BLOG_CREATE",
                isOpen: true,
                data: {
                  title: `Create Blog With AI`,
                  blogList: data?.blogs || [],
                },
              });
            }}
          >
            Create Blog
          </Button>
        </div>
        {isLoading && !isError ? (
          <SkeletonBodyText lines={20} />
        ) : (
          <IndexTableData
            data={data}
            isLoading={isLoading}
            rowMarkup={rowMarkup}
            headings={headings}
            resourceName={resourceName}
            setSearchParams={setSearchParams}
          />
        )}
      </VerticalStack>
    </>
  );
}
