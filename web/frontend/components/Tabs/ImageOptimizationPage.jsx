import { useState, useCallback } from "react";
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
} from "@shopify/polaris";
import { ImageMagicIcon, UndoIcon } from "@shopify/polaris-icons";

import { Redirect } from "@shopify/app-bridge/actions";
import { Loading, useAppBridge } from "@shopify/app-bridge-react";

export default function ImageOptimizationPage() {
  const [toBeOptimized, setToBeOptimized] = useState(44);
  const [avgSaved, setAvgSaved] = useState(92);
  const [totalSaved, setTotalSaved] = useState("14.56MB");
  const [quota, setQuota] = useState(30);

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

function IndexTableWithViewsSearchFilterSorting() {
  const shopify = useAppBridge();
  const redirect = Redirect.create(shopify);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [itemStrings, setItemStrings] = useState([
    "Products",
    "Collections",
    "Blogs",
    "All files",
  ]);

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
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

  const products = [
    {
      id: "gid://shopify/Product/8192263684330",
      featuredMediaUrl:
        "https://cdn.shopify.com/s/files/1/0670/5768/0618/products/The-Hidden-Snowboard-0c552ab6-2f42-4a6d-af65-0289db620216.jpg?v=1730454448",
      title: "The Hidden Snowboard",
      status: "Optimized",
      fileSize: "164 KB",
      action: "",
    },
  ];

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const rowMarkup = products.map(
    ({ id, featuredMediaUrl, title, status, fileSize }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          {featuredMediaUrl && featuredMediaUrl.length > 0 ? (
            <Thumbnail size="small" source={featuredMediaUrl} alt="alt" />
          ) : (
            <SkeletonThumbnail size="small" />
          )}
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
    )
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
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={products.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
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
    </LegacyCard>
  );
}
