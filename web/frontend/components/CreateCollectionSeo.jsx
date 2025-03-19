import React, { useEffect, useState, useCallback } from "react";
import {
  FormLayout,
  Button,
  Form,
  InlineError,
  Spinner,
} from "@shopify/polaris";
import { InputField } from "./commonUI/InputField";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useCreateCollectionSeo } from "../hooks/useCollectionsQuery";
import { Spinners } from "./Spinner";
import AIContainerWithTitle from "./commonUI/AIComponent/AIContainerWithTitle";
import AIButton from "./commonUI/AIButton";
import { SearchIcon } from "@shopify/polaris-icons";
import { useAI } from "../contexts/AI.context";
import {
  useCreateAIBasedSeo,
  useCreateSingleAIBasedSeo,
} from "../hooks/useAIQuery";
import AITitle from "./commonUI/AITitle";
import AITitleAndDes from "./commonUI/AIComponent/AITitleAndDes";

export function CreateCollectionSeo() {
  const { modal } = useUI();
  const { collectionSeo, setCollectionSeo } = useAI();
  const [AIkeywords, setAIKeywords] = useState("");
  const [clickIndex, setClickIndex] = useState({});
  const {
    mutate: createOrUpdateSeo,
    isError,
    isLoading,
  } = useCreateCollectionSeo();
  let collectionId = modal?.data?.info?.id.split("/").pop();
  const [formData, setFormData] = useState({
    seo_title: "",
    seo_description: "",
  });

  const [errors, setErrors] = useState({
    seo_title: "",
    seo_description: "",
  });

  //AI functionality
  const { mutate: createAISeo, isLoading: isAILoading } =
    useCreateAIBasedSeo(setAIKeywords);
  const { mutate: createSingleSeo, isLoading: isSingleLoading } =
    useCreateSingleAIBasedSeo();

  const handleChangeForKeyWords = useCallback((value) => {
    setAIKeywords(value);
  }, []);

  const handleAIChange = useCallback(
    (value, name, index) => {
      if (name === "ai_metaTitle_title") {
        let arr = [...collectionSeo?.metaTitle];
        arr[index] = value;
        let metaSeo = { ...collectionSeo, metaTitle: arr };
        setCollectionSeo(metaSeo);
      } else {
        let arr = [...collectionSeo?.metaDescription];
        arr[index] = value;
        let descSeo = { ...collectionSeo, metaDescription: arr };
        setCollectionSeo(descSeo);
      }
    },
    [collectionSeo]
  );

  const createSEOInfoWithAI = useCallback(() => {
    const requestInfo = {
      productId: collectionId,
      suggestionKeywords: AIkeywords,
      key: "scanProduct",
      item: "collection",
    };
    createAISeo(requestInfo);
  }, [createAISeo, AIkeywords]);

  const onHandleRefetch = useCallback(
    (name, index) => {
      const obj = {
        name: name,
        index: index,
        productId: collectionId,
        item: "collection",
      };
      if (name === "ai_metaTitle_title") {
        let item = collectionSeo?.metaTitle.find((_, i) => i === index);
        createSingleSeo({ ...obj, prompt: item });
      } else {
        let item = collectionSeo?.metaDescription.find((_, i) => i === index);
        createSingleSeo({ ...obj, prompt: item });
      }
      setClickIndex({
        key: `${name}_${index}`,
        isSubmit: false,
        isRefetch: true,
      });
    },
    [collectionSeo]
  );

  const onSubmitAIHandler = useCallback(
    (name, index) => {
      let info = {
        id: modal?.data?.info?.id,
        seoTitle: formData?.seo_title,
        seoDescription: formData?.seo_description,
      };

      if (name === "ai_metaTitle_title") {
        let item = collectionSeo?.metaTitle.find((_, i) => i === index);
        info = { ...info, seoTitle: item };
      } else {
        let item = collectionSeo?.metaDescription.find((_, i) => i === index);
        info = { ...info, seoDescription: item };
      }
      createOrUpdateSeo(info);
      setClickIndex({
        key: `${name}_${index}`,
        isSubmit: true,
        isRefetch: false,
      });
    },
    [collectionSeo]
  );
  // End AI functionality

  const handleSubmit = (obj) => {
    if (!obj?.seo_title) {
      return setErrors({
        ...errors,
        seo_title: `Please enter SEO title`,
      });
    } else if (obj.seo_title.length > 70) {
      return setErrors({
        ...errors,
        seo_title: `SEO title must be 70 characters or fewer. Currently, it is ${obj.seo_title.length} characters.`,
      });
    } else if (!obj?.seo_description) {
      return setErrors({
        ...errors,
        seo_description: `Please enter SEO description`,
      });
    } else if (obj.seo_description.length > 160) {
      return setErrors({
        ...errors,
        seo_description: `SEO description must be 160 characters or fewer. Currently, it is ${obj.seo_description.length} characters.`,
      });
    }
    const info = {
      id: modal?.data?.info?.id,
      seoTitle: obj.seo_title,
      seoDescription: obj?.seo_description,
    };
    createOrUpdateSeo(info);
  };

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    if (modal?.data?.info?.seo?.title || modal?.data?.info?.seo?.description) {
      setFormData({
        ...formData,
        seo_title: modal?.data?.info?.seo?.title,
        seo_description: modal?.data?.info?.seo?.description,
      });
    }
  }, [modal?.data?.info?.seo?.title, modal?.data?.info?.seo?.description]);

  return (
    <>
      <div className="product-ai-seo-generation-container">
        <AIContainerWithTitle isAIButton={true}>
          <div className="ai-action-container">
            <div className="ai-keywords-suggestion">
              <div className="ai-keywords-input">
                <InputField
                  value={AIkeywords}
                  onChange={handleChangeForKeyWords}
                  // label={"Enter keywords for suggestions"}
                  type="text"
                  name="ai_keywords_suggestion"
                  placeholder={"Enter keywords for suggestions (optional)"}
                  // error={errors?.seo_title}
                />
              </div>
              <div>
                <AIButton
                  onClick={() => createSEOInfoWithAI()}
                  icon={SearchIcon}
                  title="Generate with AI"
                />
              </div>
            </div>
          </div>
          <div className="ai-seo-result-container">
            {isAILoading && <Spinner size="large" />}
            {collectionSeo?.metaTitle?.length > 0 && (
              <div>
                <AITitle title={"Meta title AI suggestions"} />
                <div>
                  {collectionSeo?.metaTitle?.map((data, index) => (
                    <AITitleAndDes
                      name="ai_metaTitle_title"
                      data={data}
                      handleChange={handleAIChange}
                      onHandleSubmit={onSubmitAIHandler}
                      onHandleRefetch={onHandleRefetch}
                      key={index}
                      index={index}
                      isLoading={isSingleLoading || isLoading}
                      clickIndex={clickIndex}
                    />
                  ))}
                </div>
              </div>
            )}
            {collectionSeo?.metaDescription?.length > 0 && (
              <div>
                <AITitle title={"Meta description AI suggestions"} />
                <div>
                  {collectionSeo?.metaDescription?.map((data, index) => (
                    <AITitleAndDes
                      data={data}
                      name="ai_metaDesc_title"
                      handleChange={handleChange}
                      onHandleSubmit={onSubmitAIHandler}
                      key={index}
                      onHandleRefetch={onHandleRefetch}
                      index={index}
                      isLoading={isSingleLoading || isLoading}
                      clickIndex={clickIndex}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </AIContainerWithTitle>
        <div className="seo-form-container">
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
              />
              <Button primary submit loading={isLoading}>
                {isLoading ? <Spinners /> : "Submit"}
              </Button>
            </FormLayout>
          </Form>
        </div>
      </div>
    </>
  );
}
