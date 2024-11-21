import { Pagination } from "@shopify/polaris";
import React from "react";

export default function PaginationPage({
  currentPage,
  setCurrentPage,
  itemsPerPage = 30,
  itemList = [],
}) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    const totalPages = Math.ceil(itemList.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {itemList?.length > itemsPerPage && (
        <div className="center__align content__margin_top">
          <Pagination
            hasPrevious={currentPage > 1}
            onPrevious={handlePrevious}
            hasNext={currentPage < Math.ceil(itemList.length / itemsPerPage)}
            onNext={handleNext}
          />
        </div>
      )}
    </>
  );
}
