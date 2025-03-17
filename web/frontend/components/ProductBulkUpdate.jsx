import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Spinner,
  Pagination,
  SkeletonBodyText,
  Checkbox,
} from "@shopify/polaris";
import {
  useProductsQuery,
  useProductUpdateBulkSeo,
} from "../hooks/useProductsQuery";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useSearchParams } from "react-router-dom";
import { handleNext, handlePrevious } from "../utils/paginationUtils";
import GenerateAIButton from "./commonUI/GenerateAIButton";
import { useCreateBulkProductAISeo } from "../hooks/useAIQuery";
import Search from "./commonUI/Search";

export default function ProductBulkUpdate() {
  const { setToggleToast } = useUI();
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract `after` and `before` from URL
  const afterCursor = searchParams.get("after");
  const beforeCursor = searchParams.get("before");

  const { isError, isLoading, data } = useProductsQuery({
    afterCursor,
    beforeCursor,
    limit: 10,
    searchTerm: searchTerm,
  });

  const {
    mutate: updateBulkSeo,
    isError: isErrorForBulk,
    isLoading: isBulkLoading,
  } = useProductUpdateBulkSeo();

  const [formData, setFormData] = useState([]);
  const [formUpdatedData, setFormUpdatedData] = useState([]);
  const [aiGenerateIndex, setAIGenerateIndex] = useState([]);
  console.log("🚀 ~ ProductBulkUpdate ~ formUpdatedData:", formUpdatedData);

  const { mutate: createBulkAISeo, isLoading: isAIBulkLoading } =
    useCreateBulkProductAISeo(formData, setFormData, setFormUpdatedData);

  const handleSubmit = (seoContentList) => {
    if (seoContentList?.length === 0)
      return setToggleToast({
        active: true,
        message: `Please enter or change meta title or description for products`,
      });

    const findError = seoContentList.find(
      (data) =>
        data?.seo_title?.length > 70 || data?.seo_description?.length > 160
    );

    if (findError) {
      return setToggleToast({
        active: true,
        message: `SEO ${
          findError.seo_title?.length > 70 ? "title" : "description"
        } for product ${findError.title} must be ${
          findError.seo_title?.length > 70 ? "70" : "160"
        } characters or fewer. Currently, it is ${
          findError.seo_title?.length > 70
            ? findError.seo_title?.length
            : findError.seo_description?.length
        } characters.`,
      });
    }
    const newObj = {
      products: seoContentList,
    };
    updateBulkSeo(newObj);
    setFormUpdatedData([]);
    setSelectedRows([]);
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
          title: product?.title,
          seo_title: newInfo?.seo?.title,
          seo_description: newInfo?.seo?.description,
        },
      ]);
    }
  };

  useEffect(() => {
    return () => {
      // Clear URL search parameters on unmount
      setSearchParams({});
    };
  }, []);

  useEffect(() => {
    const list = data?.products?.map((product) => product?.node);
    setFormData(list);
  }, [data]);

  // Handle single row selection
  const handleRowSelect = useCallback((id) => {
    setSelectedRows(
      (prev) =>
        prev.includes(id)
          ? prev.filter((rowId) => rowId !== id) // Deselect
          : [...prev, id] // Select
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === formData.length) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(formData.map((row) => row.id)); // Select all
    }
  }, [formData, selectedRows]);

  const bulkGenerateWithAI = useCallback(
    (term, value, index) => {
      if (term == "all") {
        if (selectedRows.length === 0) {
          return setToggleToast({
            active: true,
            message: `Please select products to generate AI`,
          });
        }
        setAIGenerateIndex(index);
        createBulkAISeo({ term: term, product: selectedRows });
      } else {
        setAIGenerateIndex(index);
        createBulkAISeo({ term: term, product: [value] });
      }
    },
    [selectedRows]
  );

  return (
    <>
      <div className="app_product_bulk_update_container">
        <Form onSubmit={() => handleSubmit(formUpdatedData)}>
          <div className="seo_score_page_title_container">
            <div className="seo_score_page_title">Bulk Product SEO</div>
            <Search setSearchTerm={setSearchTerm} />
            <div className="">
              <Button primary submit disabled={isBulkLoading}>
                {isBulkLoading ? <Spinner size="small" /> : "Submit"}
              </Button>
            </div>
          </div>
          {isLoading && !isError ? (
            <SkeletonBodyText lines={20} />
          ) : (
            <>
              <div className="app_product_bulk_update">
                <div className="product_bulk_AI_selection">
                  <Checkbox
                    checked={selectedRows?.length === formData?.length}
                    onChange={handleSelectAll}
                  />
                </div>
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
                <div className="product_bulk_AI_button bold_title">
                  <GenerateAIButton
                    title="AI Generate"
                    onClick={() => bulkGenerateWithAI("all", "", "all")}
                    isLoading={isAIBulkLoading}
                    index={"all"}
                    aiGenerateIndex={aiGenerateIndex}
                  />
                </div>
              </div>
              {formData?.map((info, index) => (
                <div position={index} className="app_product_bulk_update">
                  <div className="product_bulk_AI_selection">
                    <Checkbox
                      checked={selectedRows.includes(info.id)}
                      onChange={() => handleRowSelect(info.id)}
                    />
                  </div>
                  <div className="app_product_bulk_image">
                    <img
                      src={info?.featuredImage?.url}
                      alt={info?.featuredImage?.altText}
                      className="app__feature_product_image"
                    />
                    <div className="app_product_bulk_title">{info?.title}</div>
                  </div>
                  <div className="app_product_bulk_input">
                    <TextareaField
                      value={info?.seo?.title ? info?.seo?.title : ""}
                      onChange={handleChange}
                      type="text"
                      name="seo_title"
                      placeholder={"Enter Meta Title"}
                      index={info?.id}
                      error={""}
                    />
                    {info?.seo?.title?.length > 70 && (
                      <p className="seo_validation_error">
                        SEO title must be 70 characters or fewer. Currently, it
                        is {info?.seo?.title?.length} characters.
                      </p>
                    )}
                  </div>
                  <div className="product_bulk_update_description">
                    <TextareaField
                      value={
                        info?.seo?.description ? info?.seo?.description : ""
                      }
                      onChange={handleChange}
                      name="seo_description"
                      placeholder="Enter Meta Description"
                      error={""}
                      index={info?.id}
                    />
                    {info?.seo?.description?.length > 160 && (
                      <p className="seo_validation_error">
                        SEO description must be 160 characters or fewer.
                        Currently, it is {info?.seo?.description.length}{" "}
                        characters.
                      </p>
                    )}
                  </div>
                  <div className="product_bulk_AI_button">
                    <GenerateAIButton
                      title="AI Generate"
                      onClick={() =>
                        bulkGenerateWithAI("single", info?.id, index)
                      }
                      isLoading={isAIBulkLoading}
                      index={index}
                      aiGenerateIndex={aiGenerateIndex}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </Form>

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
      </div>
    </>
  );
}
