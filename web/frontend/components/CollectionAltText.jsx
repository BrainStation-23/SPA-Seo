import React, { useEffect, useState } from "react";
import { Button, Form } from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import TextareaField from "./commonUI/TextareaField";
import { useUpdateCollectionSeoImgAlt } from "../hooks/useCollectionsQuery";
import { Spinners } from "./Spinner";

export function CollectionAltTextImage() {
  const { modal, setToggleToast } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  const image = modal?.data?.info?.image;
  const [errors, setErrors] = useState({});

  const { mutate: updateSeoAltText, isError } = useUpdateCollectionSeoImgAlt();
  const [formData, setFormData] = useState("");

  const handleSubmit = (obj) => {
    console.log("obj", obj.length);
    if (!obj) {
      return setErrors({
        ...errors,
        altText: `Please enter alt text.`,
      });
    }
    if (obj?.length > 125) {
      return setErrors({
        ...errors,
        altText: `Alt text must be 125 characters or fewer. Currently, it is ${obj?.length} characters`,
      });
    }
    setIsLoading(true);
    const info = {
      id: modal?.data?.info?.id,
      imageId: image?.id,
      atlText: obj,
    };
    updateSeoAltText(info, {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const handleChange = (value) => {
    setErrors({ ...errors, altText: "" });
    setFormData(value);
  };

  useEffect(() => {
    if (image?.url) {
      setFormData(image?.altText);
    }
  }, []);

  return (
    <div className="app__product_image_container">
      {image?.url ? (
        <div className="app__product_alt_item">
          <div className="app__product_alt_image">
            <img src={image?.url} alt={image?.altText} />
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
                    error={errors?.altText}
                    rows={2}
                  />
                </div>
                <div className="app_seo_alt_button">
                  <Button primary submit loading={isLoading}>
                    {isLoading ? <Spinners /> : "Submit"}
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
  );
}
