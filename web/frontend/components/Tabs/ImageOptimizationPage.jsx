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
} from "@shopify/polaris";
import {
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  ChoiceList,
  RangeSlider,
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
  const redirect = Redirect.create(shopify);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Extract `after` and `before` from URL
  const resourceType = searchParams.get("type") || "product";
  const pageLimit = searchParams.get("limit") || 10;
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");

  const { data, isLoading, isSuccess } = useProductsQuery({
    limit: +pageLimit,
    searchTerm,
    afterCursor,
    beforeCursor,
  });

  useEffect(() => {
    return () => {
      setSearchParams({});
    };
  }, []);

  const itemStrings = ["Products", "Collections", "Blogs", "All files"];
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
  }));

  const [selected, setSelected] = useState(0);

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

  const [accountStatus, setAccountStatus] = useState(undefined);
  const [moneySpent, setMoneySpent] = useState(undefined);
  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");

  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    []
  );
  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    []
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    []
  );
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    []
  );
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    []
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    []
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  const filters = [
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Not invited", value: "not invited" },
            { label: "Invited", value: "invited" },
            { label: "Declined", value: "declined" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  function disambiguateLabel(key, value) {
    switch (key) {
      case "moneySpent":
        return `Money spent is between $${value[0]} and $${value[1]}`;
      case "taggedWith":
        return `Tagged with ${value}`;
      case "accountStatus":
        return value.map((val) => `Customer ${val}`).join(", ");
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }

  const appliedFilters = [];
  if (accountStatus && !isEmpty(accountStatus)) {
    const key = "accountStatus";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, accountStatus),
      onRemove: handleAccountStatusRemove,
    });
  }
  if (moneySpent) {
    const key = "moneySpent";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, moneySpent),
      onRemove: handleMoneySpentRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = "taggedWith";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }

  const resourceName = {
    singular: `product`,
    plural: `products`,
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(isSuccess ? data.products : []);

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
              console.log(
                Redirect.Action.ADMIN_PATH,
                `/admin/products/${id.split("/").pop()}`
              );
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
    isSuccess &&
    data?.products
      .map(({ node }, index) => {
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
      })
      .map(({ id, featuredMediaUrl, title, status, fileSize }, index) =>
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
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        loading={isLoading}
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={isSuccess ? data.products.length : 0}
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
        pageInfo={isSuccess && data.pageInfo}
        resourcesCount={isSuccess && data.productsCount.count}
        setSearchParams={setSearchParams}
      />
    </LegacyCard>
  );
}

function CustomPagination({
  resourcesCount,
  pageInfo,
  setSearchParams,
  limit,
}) {
  const [startIndex, setStartIndex] = useState(1);

  const handleNext = () => {
    if (pageInfo?.hasNextPage) {
      const nextCursor = pageInfo?.endCursor;
      if (
        Number.parseInt(startIndex) + Number.parseInt(limit) <=
        Number.parseInt(resourcesCount)
      )
        setStartIndex((prev) => Number.parseInt(prev) + Number.parseInt(limit));
      setSearchParams((prev) => {
        // ✅ Ensure the limit is always included
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
        // ✅ Ensure the limit is always included
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
