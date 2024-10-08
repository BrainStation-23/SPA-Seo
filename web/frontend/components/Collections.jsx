import React from "react";
import {
  IndexTable,
  Text,
  HorizontalStack,
  VerticalStack,
  Button,
} from "@shopify/polaris";
import { IndexTableData } from "./commonUI/IndexTable";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { useCollectionsQuery } from "../hooks/useCollectionsQuery";

export default function CollectionsPage() {
  const { setOpenModal } = useUI();
  const { isError, isLoading, data } = useCollectionsQuery({
    url: "/api/collection/list",
  });

  const rowMarkup =
    (data &&
      data?.map((info, index) => (
        <IndexTable.Row id={info?.id} key={info?.id} position={index}>
          <IndexTable.Cell>
            {info?.image?.url ? (
              <img
                src={info?.image?.url}
                alt={info?.image?.altText}
                className="app__feature_product_image"
              />
            ) : (
              <div className="red_color">Image not available</div>
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <HorizontalStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "CREATE_COLLECTION_SEO",
                    isOpen: true,
                    data: {
                      title: `Collection SEO (${info?.title})`,
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
    { title: "Action", alignment: "center" },
  ];

  const resourceName = {
    singular: "Collection",
    plural: "Collections",
  };

  return (
    <>
      {isLoading && !isError ? (
        <Spinners />
      ) : (
        <VerticalStack gap="2">
          <div className="seo_score_page_title_container">
            <div className="seo_score_page_title">Collection SEO</div>
          </div>
          <IndexTableData
            isLoading={isLoading}
            rowMarkup={rowMarkup}
            headings={headings}
            resourceName={resourceName}
          />
        </VerticalStack>
      )}
    </>
  );
}
