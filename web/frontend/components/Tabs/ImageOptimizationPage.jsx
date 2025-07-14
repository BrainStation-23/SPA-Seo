import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  Text,
  ButtonGroup,
  Button,
  Link,
  ProgressBar,
  InlineStack,
  BlockStack,
  Divider,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Badge,
  useBreakpoints,
  Thumbnail,
  SkeletonThumbnail,
  Pagination,
  Select,
  SkeletonDisplayText,
  SkeletonBodyText,
  EmptyState,
} from "@shopify/polaris";
import { ImageMagicIcon, UndoIcon, ImageIcon } from "@shopify/polaris-icons";

import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "react-query";

import { useProductsQuery } from "../../hooks/useProductsQuery";
import { useCollectionsQuery } from "../../hooks/useCollectionsQuery";
import { useArticlesQuery } from "../../hooks/useBlogsQuery";
import { useFilesQuery } from "../../hooks/useFilesQuery";

export default function ImageOptimizationPage() {
  // State for top analytics cards
  const [toBeOptimized, setToBeOptimized] = useState(44);
  const [avgSaved, setAvgSaved] = useState(92);
  const [totalSaved, setTotalSaved] = useState("14.56MB");
  const [quota, setQuota] = useState(30);
  // need to make API endpoints for these

  return (
    <BlockStack gap={"500"}>
      {/* Top status portion */}
      <InlineStack align="space-between" gap={"300"}>
        <Box width="23%">
          <Card>
            <BlockStack gap={"500"}>
              <Text variant="headingMd" fontWeight="regular" as="h1">
                To be optimized
              </Text>
              <Text
                numeric
                variant="heading2xl"
                tone="success"
                fontWeight="regular"
              >
                {toBeOptimized}
              </Text>
            </BlockStack>
          </Card>
        </Box>
        <Box width="23%">
          <Card>
            <BlockStack gap={"500"}>
              <Text variant="headingMd" as="h1" fontWeight="regular">
                Average saved percent
              </Text>
              <Text
                numeric
                variant="heading2xl"
                tone="success"
                fontWeight="regular"
              >
                {avgSaved}%
              </Text>
            </BlockStack>
          </Card>
        </Box>
        <Box width="23%">
          <Card>
            <BlockStack gap={"500"}>
              <Text variant="headingMd" as="h1" fontWeight="regular">
                Total saved space
              </Text>
              <Text
                numeric
                variant="heading2xl"
                fontWeight="regular"
                tone="success"
              >
                {totalSaved}
              </Text>
            </BlockStack>
          </Card>
        </Box>
        <Box width="23%">
          <Card>
            <BlockStack gap={"500"}>
              <InlineStack align="space-between">
                <Text variant="headingMd" fontWeight="regular" as="h1">
                  Free Plan
                </Text>
                <Link>
                  <Text variant="bodyMd" fontWeight="regular" as="h1">
                    Upgrade
                  </Text>
                </Link>
              </InlineStack>
              <Box>
                <Text numeric variant="bodyMd" fontWeight="regular">
                  Image Quota: {quota}/60
                </Text>
                <ProgressBar tone="primary" size="small" progress={50} />
              </Box>
            </BlockStack>
          </Card>
        </Box>
      </InlineStack>

      {/* Products List */}
      <IndexTableWithViewsSearchFilterSorting />
      {/* Products List */}
    </BlockStack>
  );
}

function IndexTableWithViewsSearchFilterSorting({}) {
  const shopify = useAppBridge();
  const queryClient = useQueryClient();
  const redirect = Redirect.create(shopify);

  const [searchParams, setSearchParams] = useSearchParams();
  const [startIndex, setStartIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Extract `after` and `before` from URL
  const resourceType = searchParams.get("type") || "product";
  const pageLimit = searchParams.get("limit") || 10;
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");

  const {
    data: productData,
    isLoading: productsLoading,
    isSuccess: isProductLoadSuccess,
  } = useProductsQuery({
    limit: +pageLimit,
    searchTerm,
    afterCursor,
    beforeCursor,
    resourceType,
  });

  const {
    data: collectionData,
    isLoading: collectionsLoading,
    isSuccess: isCollectionLoadSuccess,
  } = useCollectionsQuery({
    limit: +pageLimit,
    afterCursor,
    beforeCursor,
    resourceType,
  });

  const {
    data: articleData,
    isLoading: articlesLoading,
    isSuccess: isArticleLoadSuccess,
  } = useArticlesQuery({
    limit: +pageLimit,
    afterCursor,
    beforeCursor,
    resourceType,
  });

  const {
    data: fileData,
    isLoading: filesLoading,
    isSuccess: isFileLoadSuccess,
  } = useFilesQuery({
    limit: +pageLimit,
    afterCursor,
    beforeCursor,
    resourceType,
  });

  // Combine isLoading states
  const isLoading =
    productsLoading || collectionsLoading || articlesLoading || filesLoading;
  const isDataFetchingSuccessful =
    isProductLoadSuccess ||
    isCollectionLoadSuccess ||
    isArticleLoadSuccess ||
    isFileLoadSuccess;

  useEffect(() => {
    return () => {
      setSearchParams({});
    };
  }, []);

  const [selected, setSelected] = useState(0);
  const tabs = [
    {
      id: "products",
      content: "Products",
      type: "product",
      onAction: () => {
        setStartIndex(1);
        // queryClient.invalidateQueries({ queryKey: ["productList"] });
        setSearchParams((prev) => {
          prev.delete("after");
          prev.delete("before");
          prev.set("type", "product");
          return prev;
        });
      },
    },
    {
      id: "collections",
      content: "Collections",
      type: "collection",
      onAction: () => {
        setStartIndex(1);
        // queryClient.invalidateQueries({ queryKey: ["collectionList"] });
        setSearchParams((prev) => {
          prev.delete("after");
          prev.delete("before");
          prev.set("type", "collection");
          return prev;
        });
      },
    },
    {
      id: "articles",
      content: "Articles",
      type: "article",
      onAction: () => {
        setStartIndex(1);
        // queryClient.invalidateQueries({ queryKey: ["articleList"] });
        setSearchParams((prev) => {
          prev.delete("after");
          prev.delete("before");
          prev.set("type", "article");
          return prev;
        });
      },
    },
    {
      id: "all-files",
      content: "All files",
      type: "file",
      onAction: () => {
        setStartIndex(1);
        // queryClient.invalidateQueries({ queryKey: ["filesList"] });
        setSearchParams((prev) => {
          prev.delete("after");
          prev.delete("before");
          prev.set("type", "file");
          return prev;
        });
      },
    },
  ];

  const sortOptions = [
    { label: "Order", value: "order asc", directionLabel: "Ascending" },
    { label: "Order", value: "order desc", directionLabel: "Descending" },
    { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
    { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];

  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const [queryValue, setQueryValue] = useState("");
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    []
  );
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [handleQueryValueRemove]);

  const data = {
    items: [],
    pageInfo: {},
    count: 0,
  };

  if (isProductLoadSuccess && resourceType == "product") {
    data.pageInfo = productData.pageInfo;
    data.count = productData.productsCount.count;
    data.items = productData.products.map(({ node }, index) => {
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        featuredMediaUrl: node?.featuredImage?.url,
        status: "Optimized",
        fileSize: 165.87,
        fileSizeBefore: 250,
        sizeUnit: "KB",
        position: index,
      };
    });
  } else if (isCollectionLoadSuccess && resourceType == "collection") {
    data.pageInfo = collectionData.pageInfo;
    data.count = collectionData.collectionsCount.count;
    data.items = collectionData.collections.map(({ node }, index) => {
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        featuredMediaUrl: node?.image?.url,
        status: "Optimized",
        fileSize: 165.87,
        fileSizeBefore: 250,
        sizeUnit: "KB",
        position: index,
      };
    });
  } else if (isArticleLoadSuccess && resourceType == "article") {
    data.pageInfo = articleData.pageInfo;
    data.count = articleData.articlesCount.count;
    data.items = articleData.articles.map(({ node }, index) => {
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        featuredMediaUrl: node?.image?.url,
        status: "Optimized",
        fileSize: 165.87,
        fileSizeBefore: 250,
        sizeUnit: "KB",
        position: index,
      };
    });
  } else if (isFileLoadSuccess && resourceType == "file") {
    data.pageInfo = fileData.pageInfo;
    data.count = fileData?.filesCount?.count || 100;
    data.items = fileData.files.map(({ node }, index) => {
      return {
        id: node.id.split("/").pop(),
        title: node?.image?.url.split("/").pop().split("?")[0],
        featuredMediaUrl: node?.image?.url,
        status: "Optimized",
        fileSize: 165.87,
        fileSizeBefore: 250,
        sizeUnit: "KB",
        position: index,
      };
    });
  }

  const resourceName = {
    singular: `${resourceType}`,
    plural: `${resourceType}s`,
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(isDataFetchingSuccessful ? data.items : []);

  function generateSkeletonRowMarkup() {
    const rows = [];
    for (let i = 0; i < pageLimit; i++) {
      rows.push(
        <>
          <InlineStack align="space-around" gap={"200"}>
            <SkeletonThumbnail size="small" />
            <Box width="15%">
              <SkeletonBodyText size="large" lines={2} />
            </Box>
            <Box width="15%">
              <SkeletonBodyText size="large" lines={2} />
            </Box>
            <Box width="15%">
              <SkeletonBodyText size="large" lines={2} />
            </Box>
            <Box width="15%">
              <SkeletonBodyText size="large" lines={2} />
            </Box>
            <Box width="15%">
              <InlineStack gap={"100"}>
                <Box width="45%">
                  <SkeletonDisplayText size="large" />
                </Box>
                <Box width="45%">
                  <SkeletonDisplayText size="large" />
                </Box>
              </InlineStack>
            </Box>
          </InlineStack>
          {i !== pageLimit - 1 && <Divider />}
        </>
      );
    }
    return <BlockStack gap={"200"}>{rows.map((r) => r)}</BlockStack>;
  }
  function generateRowMarkup({
    id,
    featuredMediaUrl,
    title,
    status,
    fileSize,
    position,
  }) {
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={position}
      >
        <IndexTable.Cell>
          <Thumbnail
            size="small"
            source={
              featuredMediaUrl && featuredMediaUrl.length > 0
                ? featuredMediaUrl
                : ImageIcon
            }
            alt="alt"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="regular">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone="success">{status}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <BlockStack>
            <Text as="span" textDecorationLine="line-through" tone="critical">
              200 KB
            </Text>
            <Text as="span" tone="success" numeric>
              {fileSize}
            </Text>
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Link
            onClick={(event) => {
              event.stopPropagation();
              redirect.dispatch(
                Redirect.Action.ADMIN_PATH,
                `/admin/products/${id.split("/").pop()}`
              );
            }}
          >
            View
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="action-btn-group">
            <style>
              {`
                .action-btn-group .Polaris-Button {
                  background-color: var(--p-color-bg-surface-tertiary-hover);
                }
                  .action-btn-group .Polaris-Button:hover {
                  background-color: var(--p-color-bg-surface-secondary-active);
                }
                .action-btn-group .Polaris-Button:active {
                  background-color: var(--p-color-bg-surface-tertiary-active);
                }
              `}
            </style>
            <ButtonGroup>
              <Button
                id="action-btn-group"
                size="large"
                variant="tertiary"
                icon={ImageMagicIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  // TODO: Start image compression event
                }}
              >
                Optimize
              </Button>
              <Button
                id="action-btn-group"
                size="large"
                variant="tertiary"
                icon={UndoIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  // TODO: Start image restoration event
                }}
              >
                Restore
              </Button>
            </ButtonGroup>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  }

  const rowMarkup =
    isDataFetchingSuccessful &&
    data.items.map(({ id, featuredMediaUrl, title, status, fileSize }, index) =>
      generateRowMarkup({
        id,
        title,
        position: index,
        fileSize,
        status,
        featuredMediaUrl,
      })
    );

  return (
    <LegacyCard>
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Searching in all"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => setQueryValue("")}
        onSort={setSortSelected}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        canCreateNewView={false}
        selected={selected}
        onSelect={setSelected}
        filters={[]}
        appliedFilters={[]}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        loading={isLoading}
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={isDataFetchingSuccessful ? data.items.length : 0}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        emptyState={isLoading ? generateSkeletonRowMarkup() : <EmptyState />}
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "" },
          { title: "Title" },
          { title: "Status" },
          { title: "File size" },
          { title: "Product" },
          { title: "Action" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
      <CustomPagination
        limit={pageLimit}
        pageInfo={isDataFetchingSuccessful && data.pageInfo}
        resourcesCount={isDataFetchingSuccessful && data.count}
        setSearchParams={setSearchParams}
        startIndex={startIndex}
        setStartIndex={setStartIndex}
      />
    </LegacyCard>
  );
}

function CustomPagination({
  resourcesCount,
  pageInfo,
  setSearchParams,
  limit,
  startIndex,
  setStartIndex,
}) {
  const handleNext = () => {
    if (pageInfo?.hasNextPage) {
      const nextCursor = pageInfo?.endCursor;
      if (
        Number.parseInt(startIndex) + Number.parseInt(limit) <=
        Number.parseInt(resourcesCount)
      )
        setStartIndex((prev) => Number.parseInt(prev) + Number.parseInt(limit));
      setSearchParams((prev) => {
        prev.set("limit", String(limit));
        prev.set("after", nextCursor);
        prev.delete("before");
        return prev;
      });
    }
  };

  const handlePrevious = () => {
    if (pageInfo?.hasPreviousPage) {
      const prevCursor = pageInfo?.startCursor;
      if (Number.parseInt(startIndex) - Number.parseInt(limit) > 0)
        setStartIndex((prev) => Number.parseInt(prev) - Number.parseInt(limit));
      setSearchParams((prev) => {
        prev.set("limit", String(limit));
        prev.set("before", prevCursor);
        prev.delete("after");
        return prev;
      });
    }
  };

  const handleLimitChange = (value) => {
    setStartIndex(1);
    setSearchParams((prev) => {
      prev.set("limit", value);
      prev.delete("after");
      prev.delete("before");
      return prev;
    });
  };

  return (
    <>
      <Divider borderColor="border-brand" />
      <Box
        paddingBlockStart="400"
        paddingBlockEnd="200"
        paddingInlineStart="400"
        paddingInlineEnd="400"
        background="bg-fill-active"
      >
        <InlineStack blockAlign="center" align="end" gap="400">
          <InlineStack gap={"100"}>
            <Text variant="bodySm" fontWeight="regular">
              Page limit:
            </Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "50", value: "50" },
              ]}
            />
          </InlineStack>

          <Pagination
            hasNext={pageInfo.hasNextPage}
            hasPrevious={pageInfo.hasPreviousPage}
            onNext={handleNext}
            onPrevious={handlePrevious}
            label={
              <InlineStack gap={"100"}>
                <Text variant="bodySm" fontWeight="regular">
                  {startIndex} -
                  {Number.parseInt(startIndex) + Number.parseInt(limit) - 1 <
                  Number.parseInt(resourcesCount)
                    ? Number.parseInt(startIndex) + Number.parseInt(limit) - 1
                    : Number.parseInt(resourcesCount)}
                </Text>
                <Text variant="bodySm" fontWeight="regular">
                  out of {resourcesCount}
                </Text>
              </InlineStack>
            }
          />
        </InlineStack>
      </Box>
    </>
  );
}
