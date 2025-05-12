import React, { useEffect } from "react";
import {
  IndexTable,
  Text,
  InlineStack,
  BlockStack,
  Button,
  SkeletonBodyText,
} from "@shopify/polaris";
import { IndexTableData } from "./commonUI/IndexTable";
import { useUI } from "../contexts/ui.context";
import { useCollectionsQuery } from "../hooks/useCollectionsQuery";
import { useSearchParams } from "react-router-dom";

export default function CollectionsPage() {
  const { setOpenModal } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  // Extract `after` and `before` from URL
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");

  const { isError, isLoading, data } = useCollectionsQuery({
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
      data?.collections?.map((info, index) => (
        <IndexTable.Row id={info?.id} key={info?.id} position={index}>
          <IndexTable.Cell>
            {info?.image?.url ? (
              <img
                src={info?.image?.url}
                alt={info?.image?.altText}
                className="app__feature_product_image"
              />
            ) : (
              <div className="red_color">Image not available</div>
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "CREATE_COLLECTION_SEO",
                    isOpen: true,
                    data: {
                      title: `Collection SEO (${info?.title})`,
                      info: info,
                    },
                  });
                }}
              >
                SEO
              </Button>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))) ||
    [];

  const headings = [
    { title: "Image" },
    { title: "Name" },
    { title: "Action", alignment: "center" },
  ];

  const resourceName = {
    singular: "Collection",
    plural: "Collections",
  };

  return (
    <>
      <BlockStack gap="2">
        <div className="seo_score_page_title_container">
          <div className="seo_score_page_title">Collection SEO</div>
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
      </BlockStack>
    </>
  );
}
