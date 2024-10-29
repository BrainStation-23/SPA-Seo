import React, { useEffect, useState } from "react";
import { Button, Form } from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useUpdateProductSeoImgAlt } from "../hooks/useProductsQuery";

export function AltimageCreate() {
  const { modal, setToggleToast } = useUI();
  const images = modal?.data?.info?.media?.edges?.map((data) => {
    const node = data?.node;
    return {
      id: node.id,
      url: node.preview.image.url,
      altText: node.alt,
      originalSrc: node.preview.image.url,
    };
  });

  const { mutate: updateSeoAltText, isError } = useUpdateProductSeoImgAlt();
  const [formData, setFormData] = useState([]);

  const handleSubmit = (obj) => {
    if (!obj?.altText) {
      return setToggleToast({
        active: true,
        message: `Alt text cannot be empty`,
      });
    }

    const info = {
      id: modal?.data?.info?.id,
      imageId: obj?.id,
      altText: obj?.altText,
    };
    updateSeoAltText(info);
  };

  const handleChange = (value, name, index) => {
    const images = [...formData];
    const data = { ...images[index], altText: value };
    images[index] = data;
    setFormData(images);
  };

  useEffect(() => {
    if (images?.length > 0) {
      setFormData(images);
    }
  }, []);

  return (
    <div className="app__product_image_container">
      {formData?.map((image, index) => (
        <div className="app__product_alt_item">
          <div className="app__product_alt_image">
            <img src={image?.originalSrc} alt={image?.altText} />
          </div>
          <div className="app__product_alt_textarea">
            <Form
              className="app__product_alt_textarea"
              onSubmit={() => handleSubmit(image)}
            >
              <div className="app__seo_alt_form">
                <div className="app__seo_alt_textarea">
                  <TextareaField
                    value={image?.altText}
                    onChange={handleChange}
                    label={"Enter image alt text"}
                    type="text"
                    name="seo_description"
                    placeholder="Enter image alt text"
                    error={""}
                    index={index}
                  />
                </div>
                <div className="app_seo_alt_button">
                  <Button primary submit>
                    Submit
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      ))}
    </div>
  );
}
