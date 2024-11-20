import { IndexTable, LegacyCard, Pagination } from "@shopify/polaris";
import React, { useState } from "react";

export function IndexTableData({
  rowMarkup,
  headings,
  resourceName,
  currentPage,
  changePage,
  pageInfo,
}) {
  const currentPageData = rowMarkup;

  const handlePrevious = () => {
    if (pageInfo?.hasPreviousPage) {
      changePage(currentPage - 1, "prev");
    }
  };

  const handleNext = () => {
    if (pageInfo?.hasNextPage) {
      changePage(currentPage + 1, "next");
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
