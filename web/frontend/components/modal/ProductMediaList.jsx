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
  SkeletonDisplayText,
  SkeletonBodyText,
  EmptyState,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { useSearchParams } from "react-router-dom";
import { useProductMediaQuery } from "../../hooks/useProductsQuery";

export default function ProductMediaList({ productId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceType = searchParams.get("type") || "product";
  const { data, isLoading, isSuccess, isError } = useProductMediaQuery({
    productId,
    resourceType,
  });

  const items =
    isSuccess &&
    data.map((node) => {
      return {
        id: node.id.split("/").pop(),
        imgUrl: node.image.url,
        fileName: node.image.url.split("/").pop().split("?")[0],
        size: new Number(
          Number.parseInt(node.originalSource.fileSize) / 1024
        ).toPrecision(4),
        status: "Optimized",
      };
    });
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(isSuccess ? items : []);

  function generateSkeletonRowMarkup() {
    const rows = [];
    for (let i = 0; i < 3; i++) {
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
              <SkeletonDisplayText size="small" />
            </Box>
          </InlineStack>
          <Divider />
        </>
      );
    }
    return <BlockStack gap={"200"}>{rows.map((r) => r)}</BlockStack>;
  }
  const rowMarkup = isSuccess
    ? items.map(({ id, imgUrl, fileName, size, status }, index) => (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>
            <Thumbnail
              size="small"
              source={imgUrl && imgUrl.length > 0 ? imgUrl : ImageIcon}
              alt="alt"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd" breakWord fontWeight="regular">
              {fileName}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="regular">
              {size} KB
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone="success">{status}</Badge>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))
    : [];

  return (
    <Card padding={"0"} roundedAbove="">
      <IndexTable
        resourceName={resourceName}
        itemCount={isSuccess ? items.length : 0}
        emptyState={isLoading ? generateSkeletonRowMarkup() : <EmptyState />}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "" },
          { title: "Filename" },
          { title: "Size" },
          { title: "Status" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
