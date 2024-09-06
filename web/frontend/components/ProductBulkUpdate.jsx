import React, { useEffect, useState } from "react";
import { Button, Form } from "@shopify/polaris";
import {
  useProductsQuery,
  useProductUpdateBulkSeo,
} from "../hooks/useProductsQuery";
import { Spinners } from "./Spinner";
import { useUI } from "../contexts/ui.context";
import { InputField } from "./commonUI/InputField";
import TextareaField from "./commonUI/TextareaField";
import Pagination from "./commonUI/Pagination";

export default function ProductBulkUpdate() {
  const { setToggleToast } = useUI();
  const { isError, isLoading, data } = useProductsQuery({
    url: "/api/product/list",
  });
  const { mutate: updateBulkSeo, isError: isErrorForBulk } =
    useProductUpdateBulkSeo();

  const [formData, setFormData] = useState([]);
  const [formUpdatedData, setFormUpdatedData] = useState([]);

  const handleSubmit = (obj) => {
    if (obj?.length === 0)
      return setToggleToast({
        active: true,
        message: `Please enter meta title or description`,
      });
    const newObj = {
      products: obj,
    };
    updateBulkSeo(newObj);
    setFormUpdatedData([]);
  };

  const handleChange = (value, name, id) => {
    const products = [...formData];
    const productIndex = products.findIndex((product) => product.id === id);
    if (productIndex === -1) return;
    const product = products[productIndex];
    const newInfo = {
      ...product,
      seo: {
        ...product?.seo,
        title: name === "seo_title" ? value : product?.seo?.title,
        description:
          name === "seo_description" ? value : product?.seo?.description,
      },
    };
    products[productIndex] = newInfo;
    setFormData(products);

    const updatedData = formUpdatedData?.find(
      (data) => data?.id === product?.id
    );
    if (updatedData) {
      const newData = formUpdatedData.map((data) =>
        data?.id === product?.id
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
          id: product?.id,
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
            <div className="app_product_bulk_update_button">
              <Button primary submit>
                Submit
              </Button>
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
              <div position={index} className="app_product_bulk_update">
                <div className="app_product_bulk_image">
                  <img
                    src={info?.featuredImage?.url}
                    alt={info?.featuredImage?.altText}
                    className="app__feature_product_image"
                  />
                  <div className="app_product_bulk_title">{info?.title}</div>
                </div>
                <div className="app_product_bulk_input">
                  <InputField
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
