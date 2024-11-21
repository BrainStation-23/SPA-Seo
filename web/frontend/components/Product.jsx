import React, { useEffect } from "react";
import {
  IndexTable,
  Text,
  HorizontalStack,
  VerticalStack,
  Button,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useProductsQuery } from "../hooks/useProductsQuery";
import { IndexTableData } from "./commonUI/IndexTable";
// import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { useSearchParams } from "react-router-dom";

export default function Product() {
  const { setOpenModal, modal } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract `after` and `before` from URL
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");

  const { isError, isLoading, data, isRefetching } = useProductsQuery({
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
      data?.products?.map((info, index) => (
        <IndexTable.Row
          id={info?.node?.id}
          key={info?.node?.id}
          position={index}
        >
          <IndexTable.Cell>
            <img
              src={info?.node?.featuredImage?.url}
              alt={info?.node?.featuredImage?.altText}
              className="app__feature_product_image"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.node?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.node?.status}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <HorizontalStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "CREATE_PRODUCT_SEO",
                    isOpen: true,
                    data: {
                      title: `Product SEO (${info?.node?.title})`,
                      info: info?.node,
                    },
                  });
                }}
              >
                SEO
              </Button>
            </HorizontalStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))) ||
    [];

  const headings = [
    { title: "Image" },
    { title: "Name" },
    { title: "Status" },
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
          <div className="seo_score_page_title">Product SEO</div>
        </div>
        {isLoading && !isError ? (
          <SkeletonBodyText lines={20} />
        ) : (
          <IndexTableData
            data={data}
            isRefetching={isRefetching || isLoading}
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
