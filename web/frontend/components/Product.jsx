import React, { useState, useEffect } from "react";
import {
  IndexTable,
  Text,
  HorizontalStack,
  VerticalStack,
  Button,
} from "@shopify/polaris";
import { useProductsQuery } from "../hooks/useProductsQuery";
import { IndexTableData } from "./commonUI/IndexTable";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";

export default function Product() {
  const { setOpenModal, modal } = useUI();

  // Pagination state variables
  const [action, setAction] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevCursor, setPrevCursor] = useState(null);
  const { isError, isLoading, data, isFetching, isRefetching, refetch } =
    useProductsQuery({
      url: `/api/product/list?page=${currentPage}&startCursor=${pageInfo?.startCursor}&endCursor=${pageInfo?.endCursor}&prevCursor=${prevCursor}&action=${action}`,
    });

  const changePageCursorState = (pageNo, action) => {
    if (data?.pageInfo) {
      setPageInfo(data?.pageInfo);
    }
    setAction(action);
    setCurrentPage(pageNo);
  };

  const rowMarkup =
    (data &&
      data?.allProducts?.map((info, index) => (
        <IndexTable.Row id={info?.id} key={info?.id} position={index}>
          <IndexTable.Cell>
            <img
              src={info?.featuredImage?.url}
              alt={info?.featuredImage?.altText}
              className="app__feature_product_image"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.status}</Text>
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
                      title: `Product SEO (${info?.title})`,
                      info: info,
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

  // useEffect(() => {
  //   if (data?.pageInfo) {
  //     setPageInfo(data?.pageInfo);
  //   }
  // }, [isFetching]);

  useEffect(() => {
    setPrevCursor(data?.pageInfo?.endCursor);
    refetch({ queryKey: "productList" });
  }, [currentPage]);

  return (
    <>
      {(isLoading || isRefetching) && !isError ? (
        <Spinners />
      ) : (
        <VerticalStack gap="2">
          <div className="seo_score_page_title_container">
            <div className="seo_score_page_title">Product SEO</div>
          </div>
          <IndexTableData
            isLoading={isLoading}
            rowMarkup={rowMarkup}
            headings={headings}
            resourceName={resourceName}
            currentPage={currentPage}
            changePage={changePageCursorState}
            setAction={setAction}
            pageInfo={data?.pageInfo}
          />
        </VerticalStack>
      )}
    </>
  );
}
