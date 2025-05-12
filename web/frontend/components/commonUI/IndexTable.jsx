import { IndexTable, Card, Pagination } from "@shopify/polaris";
import React from "react";
import { handleNext, handlePrevious } from "../../utils/paginationUtils";
// import { Spinners } from "../Spinner";

export function IndexTableData({
  data,
  rowMarkup,
  headings,
  resourceName,
  setSearchParams,
}) {
  const currentPageData = rowMarkup;
  // Handle Next button
  // const handleNext = () => {
  //   if (data?.pageInfo?.hasNextPage) {
  //     const nextCursor = data?.pageInfo?.endCursor;
  //     setSearchParams({ after: nextCursor });
  //   }
  // };

  // // Handle Previous button
  // const handlePrevious = () => {
  //   if (data?.pageInfo?.hasPreviousPage) {
  //     const prevCursor = data?.pageInfo?.startCursor;
  //     setSearchParams({ before: prevCursor });
  //   }
  // };
  return (
    <>
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={rowMarkup?.length}
          selectable={false}
          headings={headings}
        >
          {currentPageData}
        </IndexTable>
      </Card>
      {/* {isRefetching ? (
        <Spinners />
      ) : ( */}
      <>
        {(data?.pageInfo?.hasPreviousPage || data?.pageInfo?.hasNextPage) && (
          <div className="center__align content__margin_top">
            <Pagination
              hasPrevious={data?.pageInfo?.hasPreviousPage}
              onPrevious={() => handlePrevious(data, setSearchParams)}
              hasNext={data?.pageInfo?.hasNextPage}
              onNext={() => handleNext(data, setSearchParams)}
            />
          </div>
        )}{" "}
      </>
      {/* )} */}
    </>
  );
}
