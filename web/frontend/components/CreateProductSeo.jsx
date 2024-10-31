import React, { useEffect, useState } from "react";
import { FormLayout, Button, Form, InlineError, Spinner } from "@shopify/polaris";
import { InputField } from "./commonUI/InputField";
import { useCreateProductSeo } from "../hooks/useProductsQuery";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";

export function CreateProductSeo() {
  const [isLoading, setIsLoading] = useState(false);
  const { modal } = useUI();
  const { mutate: createOrUpdateSeo, isError } = useCreateProductSeo();

  const [formData, setFormData] = useState({
    seo_title: "",
    seo_description: "",
  });

  const [errors, setErrors] = useState({
    seo_title: "",
    seo_description: "",
  });

  const handleSubmit = (obj) => {
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

    setIsLoading(true);
    const info = {
      id: modal?.data?.info?.id,
      seoTitle: obj?.seo_title,
      seoDescription: obj?.seo_description,
    };
    createOrUpdateSeo(info, {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
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
    </>
  );
}
