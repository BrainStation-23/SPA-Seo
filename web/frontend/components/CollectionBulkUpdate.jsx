import React, { useEffect, useState } from "react";
import { Button, Form } from "@shopify/polaris";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { InputField } from "./commonUI/InputField";
import TextareaField from "./commonUI/TextareaField";
import Pagination from "./commonUI/Pagination";
import {
  useCollectionUpdateBulkSeo,
  useCollectionsQuery,
} from "../hooks/useCollectionsQuery";

export default function CollectionBulkUpdate() {
  const { setToggleToast } = useUI();
  const { isError, isLoading, data } = useCollectionsQuery({
    url: "/api/collection/list",
  });
  const { mutate: updateBulkSeo, isError: isErrorForBulk } =
    useCollectionUpdateBulkSeo();

  const [formData, setFormData] = useState([]);
  const [formUpdatedData, setFormUpdatedData] = useState([]);

  const handleSubmit = (obj) => {
    if (obj?.length === 0)
      return setToggleToast({
        active: true,
        message: `Please enter meta title or description`,
      });
    const newObj = {
      collections: obj,
    };
    updateBulkSeo(newObj);
    setFormUpdatedData([]);
  };

  const handleChange = (value, name, id) => {
    const collections = [...formData];
    const collectionIndex = collections.findIndex(
      (product) => product.id === id
    );
    if (collectionIndex === -1) return;
    const collection = collections[collectionIndex];
    const newInfo = {
      ...collection,
      seo: {
        ...collection?.seo,
        title: name === "seo_title" ? value : collection?.seo?.title,
        description:
          name === "seo_description" ? value : collection?.seo?.description,
      },
    };
    collections[collectionIndex] = newInfo;
    setFormData(collections);

    const updatedData = formUpdatedData?.find(
      (data) => data?.id === collection?.id
    );
    if (updatedData) {
      const newData = formUpdatedData.map((data) =>
        data?.id === collection?.id
          ? {
              ...data,
              seo_title: newInfo?.seo?.title,
              seo_description: newInfo?.seo?.description,
            }
          : data
      );
      setFormUpdatedData(newData);
    } else {
      setFormUpdatedData([
        ...formUpdatedData,
        {
          id: collection?.id,
          seo_title: newInfo?.seo?.title,
          seo_description: newInfo?.seo?.description,
        },
      ]);
    }
  };

  // Pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the data for the current page
  const currentPageData = formData?.slice(startIndex, endIndex);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  return (
    <>
      {isLoading && !isError ? (
        <Spinners />
      ) : (
        <div className="app_product_bulk_update_container">
          <Form onSubmit={() => handleSubmit(formUpdatedData)}>
            <div className="seo_score_page_title_container">
              <div className="seo_score_page_title">Bulk Collection SEO</div>
              <div className="">
                <Button primary submit>
                  Submit
                </Button>
              </div>
            </div>

            <div className="app_product_bulk_update">
              <div className="app_product_bulk_image">
                <div className="bold_title">Image</div>
                <div className="app_product_bulk_title bold_title">Name</div>
              </div>
              <div className="app_product_bulk_input bold_title">
                Meta title
              </div>
              <div className="product_bulk_update_description bold_title">
                Meta Description
              </div>
            </div>
            {currentPageData?.map((info, index) => (
              <div
                position={index}
                className="app_product_bulk_update"
                key={info?.id}
              >
                <div className="app_product_bulk_image">
                  <img
                    src={info?.image?.url}
                    alt={info?.image?.altText}
                    className="app__feature_product_image"
                  />
                  <div className="app_product_bulk_title">{info?.title}</div>
                </div>
                <div className="app_product_bulk_input">
                  <TextareaField
                    value={info?.seo?.title ? info.seo.title : ""}
                    onChange={handleChange}
                    type="text"
                    name="seo_title"
                    placeholder={"Enter Meta Title"}
                    index={info?.id}
                    error={""}
                  />
                </div>
                <div className="product_bulk_update_description">
                  <TextareaField
                    value={info?.seo?.description ? info?.seo?.description : ""}
                    onChange={handleChange}
                    name="seo_description"
                    placeholder="Enter Meta Description"
                    error={""}
                    index={info?.id}
                  />
                </div>
              </div>
            ))}
          </Form>
          {data?.length > 10 && (
            <div className="center__align content__margin_top">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                itemList={data}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
