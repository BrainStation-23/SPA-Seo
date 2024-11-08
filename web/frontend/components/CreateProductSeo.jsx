import React, { useEffect, useState } from "react";
import {
  FormLayout,
  Button,
  Form,
  InlineError,
  Spinner,
  Icon,
} from "@shopify/polaris";
import { InputField } from "./commonUI/InputField";
import { useCreateProductSeo } from "../hooks/useProductsQuery";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useCreateAIBasedSeo } from "../hooks/useAIQuery";
import AITitle from "./commonUI/AITitle";
import AIContainerWithTitle from "./commonUI/AIComponent/AIContainerWithTitle";
import { useCallback } from "react";
import { useAI } from "../contexts/AI.context";
import AITitleAndDes from "./commonUI/AIComponent/AITitleAndDes";
import { SearchIcon } from "@shopify/polaris-icons";
import AIButton from "./commonUI/AIButton";

export function CreateProductSeo() {
  const { modal } = useUI();
  const { productSeo } = useAI();
  const [AIkeywords, setAIKeywords] = useState("");
  const {
    mutate: createOrUpdateSeo,
    isError,
    isLoading,
  } = useCreateProductSeo();
  const { mutate: createAISeo, isLoading: isAILoading } =
    useCreateAIBasedSeo(setAIKeywords);
  const [formData, setFormData] = useState({
    seo_title: "",
    seo_description: "",
  });

  const [errors, setErrors] = useState({
    seo_title: "",
    seo_description: "",
  });

  const handleSubmit = useCallback(
    (obj) => {
      if (!obj?.seo_title) {
        return setErrors({
          ...errors,
          seo_title: `Please enter SEO title`,
        });
      } else if (obj?.seo_title?.length > 70) {
        return setErrors({
          ...errors,
          seo_title: `SEO title must be 70 characters or fewer. Currently, it is ${obj.seo_title.length} characters.`,
        });
      } else if (!obj?.seo_description) {
        return setErrors({
          ...errors,
          seo_description: `Please enter SEO description`,
        });
      } else if (obj?.seo_description?.length > 160) {
        return setErrors({
          ...errors,
          seo_description: `SEO description must be 160 characters or fewer. Currently, it is ${obj.seo_description.length} characters.`,
        });
      }

      const info = {
        id: modal?.data?.info?.id,
        seoTitle: obj?.seo_title,
        seoDescription: obj?.seo_description,
      };
      createOrUpdateSeo(info);
    },
    [createOrUpdateSeo]
  );

  const handleChange = useCallback((value, name) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  }, []);

  useEffect(() => {
    if (modal?.data?.info?.seo?.title || modal?.data?.info?.seo?.description) {
      setFormData({
        ...formData,
        seo_title: modal?.data?.info?.seo?.title,
        seo_description: modal?.data?.info?.seo?.description,
      });
    }
  }, [modal?.data?.info?.seo?.title, modal?.data?.info?.seo?.description]);

  //ai functionality
  const handleChangeForKeyWords = useCallback((value) => {
    setAIKeywords(value);
  }, []);

  const createSEOInfoWithAI = useCallback(
    (key) => {
      let productId = modal?.data?.info?.id.split("/").pop();
      if (key === "scanProduct") {
        const requestInfo = {
          productId: productId,
          key: "scanProduct",
        };
        createAISeo(requestInfo);
      } else {
        const requestInfo = {
          productId: productId,
          suggestionKeywords: AIkeywords,
          key: "suggestion",
        };
        createAISeo(requestInfo);
      }
    },
    [createAISeo, AIkeywords]
  );

  return (
    <div className="product-ai-seo-generation-container">
      <AIContainerWithTitle isAIButton={true}>
        <div className="ai-action-container">
          <div>
            <AIButton
              onClick={() => createSEOInfoWithAI("scanProduct")}
              icon={SearchIcon}
              title="Scan product with AI"
            />
          </div>
          OR
          <div className="ai-keywords-suggestion">
            <InputField
              value={AIkeywords}
              onChange={handleChangeForKeyWords}
              // label={"Enter keywords for suggestions"}
              type="text"
              name="ai_keywords_suggestion"
              placeholder={"Enter keywords for suggestions"}
              // error={errors?.seo_title}
            />
            <div>
              <Button primary onClick={() => createSEOInfoWithAI("suggestion")}>
                Submit
              </Button>
            </div>
          </div>
        </div>
        <div className="ai-seo-result-container">
          {isAILoading && <Spinner size="large" />}
          {productSeo?.metaTitle?.length > 0 && (
            <div>
              <AITitle title={"Meta title suggestions"} />
              <div>
                {productSeo?.metaTitle?.map((data, index) => (
                  <AITitleAndDes
                    data={data}
                    handleChange={handleChange}
                    key={index}
                  />
                ))}
              </div>
            </div>
          )}
          {productSeo?.metaDescription?.length > 0 && (
            <div>
              <AITitle title={"Meta description suggestions"} />
              <div>
                {productSeo?.metaDescription?.map((data, index) => (
                  <AITitleAndDes
                    data={data}
                    handleChange={handleChange}
                    key={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AIContainerWithTitle>
      <div className="seo-form-container">
        <AITitle title={"Create seo content"} />
        {isError && <InlineError message={"Something went wrong"} />}
        <Form onSubmit={() => handleSubmit(formData)}>
          <FormLayout>
            <InputField
              value={formData?.seo_title}
              onChange={handleChange}
              label={"Enter Meta Title"}
              type="text"
              name="seo_title"
              placeholder={"Enter Meta Title"}
              error={errors?.seo_title}
            />
            <TextareaField
              value={formData?.seo_description}
              onChange={handleChange}
              label={"Enter Meta Description"}
              type="text"
              name="seo_description"
              placeholder="Enter Meta Description"
              error={errors?.seo_description}
              rows={"3"}
            />
            <Button primary submit disabled={isLoading}>
              {isLoading ? <Spinner size="small" /> : "Submit"}
            </Button>
          </FormLayout>
        </Form>
      </div>
    </div>
  );
}
