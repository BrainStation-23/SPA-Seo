import { IndexTable, LegacyCard, Pagination } from "@shopify/polaris";
import React, { useState } from "react";

export function IndexTableData({
  rowMarkup,
  headings,
  resourceName,
  itemsPerPage = 20,
  currentPage,
  setCurrentPage,
  setAction,
  pageInfo,
}) {
  const currentPageData = rowMarkup;

  const handlePrevious = () => {
    if (pageInfo?.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
      setAction("prev");
    }
  };

  const handleNext = () => {
    if (pageInfo?.hasNextPage) {
      setCurrentPage(currentPage + 1);
      setAction("next");
    }
  };

  return (
    <>
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={rowMarkup?.length}
          selectable={false}
          headings={headings}
        >
          {currentPageData}
        </IndexTable>
      </LegacyCard>
      {(pageInfo?.hasPreviousPage || pageInfo?.hasNextPage) && (
        <div className="center__align content__margin_top">
          <Pagination
            hasPrevious={pageInfo?.hasPreviousPage}
            onPrevious={handlePrevious}
            hasNext={pageInfo?.hasNextPage}
            onNext={handleNext}
          />
        </div>
      )}
    </>
  );
}
