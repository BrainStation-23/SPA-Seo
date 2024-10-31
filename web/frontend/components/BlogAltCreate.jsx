import React, { useEffect, useState } from "react";
import { Button, Form } from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useSingleArticleQuery, useUpdateArticleSeoImgAlt } from "../hooks/useBlogsQuery";
import { Spinners } from "./Spinner";

export function ArticleAltTextImage() {
  const { modal, setToggleToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { data, isLoading } = useSingleArticleQuery({
    url: `/api/blog/articleById/${modal?.data?.info?.blog_id}/${modal?.data?.info?.id}`,
  });
  const image = data?.image;
  const { mutate: updateSeoAltText, isError } = useUpdateArticleSeoImgAlt();
  const [formData, setFormData] = useState("");

  const handleSubmit = (input) => {
    if (!input) {
      return setErrors({
        ...errors,
        message: `Alt text cannot be empty`,
      });
    }
    if (input.length > 125) {
      return setErrors({
        ...errors,
        message: `Alt text must be 125 characters or fewer. Currently, it is ${input.length} characters.`,
      });
    }
    setLoading(true);
    const info = {
      id: modal?.data?.info?.id,
      blogId: modal?.data?.info?.blog_id,
      image: {
        ...image,
        alt: input,
      },
    };
    updateSeoAltText(info, {
      onSuccess: () => {
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  const handleChange = (value) => {
    setFormData(value);
    setErrors({ ...errors, message: "" });
  };

  useEffect(() => {
    if (image?.src) {
      setFormData(image?.alt);
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <Spinners />
      ) : (
        <div className="app__product_image_container">
          {image?.src ? (
            <div className="app__product_alt_item">
              <div className="app__product_alt_image">
                <img src={image?.src} alt={image?.alt} />
              </div>
              <div className="app__product_alt_textarea">
                <Form className="app__product_alt_textarea" onSubmit={() => handleSubmit(formData)}>
                  <div className="app__seo_alt_form">
                    <div className="app__seo_alt_textarea">
                      <TextareaField
                        value={formData}
                        onChange={handleChange}
                        label={"Enter image alt text"}
                        type="text"
                        name="altText"
                        placeholder="Enter image alt text"
                        error={errors?.message}
                        rows={2}
                      />
                    </div>
                    <div className="app_seo_alt_button">
                      <Button primary submit loading={loading}>
                        {loading ? <Spinners /> : "Submit"}
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          ) : (
            <div>Image not available </div>
          )}
        </div>
      )}
    </>
  );
}
