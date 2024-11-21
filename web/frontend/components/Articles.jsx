import React, { useState } from "react";
import { HorizontalStack, VerticalStack, Button } from "@shopify/polaris";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { useArticlesQuery } from "../hooks/useBlogsQuery";
import PaginationPage from "./commonUI/Pagination";

export default function ArticlesPage() {
  const { setOpenModal, modal } = useUI();
  const gid = modal?.data?.info?.id?.split("/");
  const { isError, isLoading, data } = useArticlesQuery({
    url: `/api/blog/articles/${gid?.[4]}`,
  });

  // Pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the data for the current page
  const currentPageData = data?.slice(startIndex, endIndex);

  const rowMarkup = (
    <>
      <div className="app_product_bulk_update">
        <div className="app_product_bulk_input bold_title">Name</div>
        <div className="app_product_bulk_input bold_title">Tags</div>
        <div className="app_product_bulk_input bold_title">Author</div>
        <div className="app_product_bulk_input bold_title">Actions</div>
      </div>
      {currentPageData?.map((info, index) => (
        <div position={index} className="app_product_bulk_update">
          <div className="app_product_bulk_input">{info?.title}</div>
          <div className="app_product_bulk_input">{info?.tags}</div>
          <div className="app_product_bulk_input">{info?.author}</div>
          <div className="app_product_bulk_input">
            <HorizontalStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "ARTICLE_SEO",
                    isOpen: true,
                    data: {
                      title: `Article SEO (${info?.title})`,
                      info: info,
                    },
                  });
                }}
              >
                SEO
              </Button>
            </HorizontalStack>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      {isLoading && !isError ? (
        <Spinners />
      ) : (
        <VerticalStack gap="2">
          {rowMarkup}
          {data?.length > itemsPerPage && (
            <div className="center__align content__margin_top">
              <PaginationPage
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                itemList={data}
              />
            </div>
          )}
        </VerticalStack>
      )}
    </>
  );
}
