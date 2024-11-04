import React from "react";
import { IndexTable, Text, HorizontalStack, VerticalStack, Button } from "@shopify/polaris";
import { IndexTableData } from "./commonUI/IndexTable";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { useBlogsQuery } from "../hooks/useBlogsQuery";

export default function BlogPage() {
  const { setOpenModal } = useUI();
  const { isError, isLoading, data } = useBlogsQuery({
    url: "/api/blog/list",
  });


  const rowMarkup =
    (data &&
      data?.map((info, index) => (
        <IndexTable.Row id={info?.id} key={info?.id} position={index}>
          <IndexTable.Cell>
            <Text as="span">{info?.title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.tags}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <HorizontalStack gap="4" align="center">
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    view: "BLOG_SEO",
                    isOpen: true,
                    data: {
                      title: `Blog (${info?.title})`,
                      info: info,
                    },
                  });
                }}
              >
                Articles
              </Button>
            </HorizontalStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))) ||
    [];

  const headings = [{ title: "Name" }, { title: "Tags" }, { title: "Action", alignment: "center" }];

  const resourceName = {
    singular: "Product",
    plural: "Products",
  };

  return (
    <>
      {isLoading && !isError ? (
        <Spinners />
      ) : (
        <VerticalStack gap="2">
          <div className="seo_score_page_title_container">
            <div className="seo_score_page_title">Blog SEO</div>
          </div>
          <IndexTableData isLoading={isLoading} rowMarkup={rowMarkup} headings={headings} resourceName={resourceName} />
        </VerticalStack>
      )}
    </>
  );
}
