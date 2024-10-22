import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  TextField,
  Checkbox,
  Layout,
  Card,
  Select,
  IndexTable,
  Spinner,
  useIndexResourceState,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { useImageCompression } from "../contexts/imageCompression.context";

export function ImageCompression() {
  const fetcher = useAuthenticatedFetch();
  const { modal, setToggleToast } = useUI();
  const { images, setImages } = useImageCompression();
  const [productInfoById, setProductInfoById] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replaceOrginalImage, setReplaceOrginalImage] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState({
    width: "",
    height: "",
    quality: 80,
    format: "jpg",
  });
  const [isSaving, setIsSaving] = useState(false);

  const OPTION = [
    { label: "JPG", value: "jpg" },
    { label: "PNG", value: "png" },
    { label: "GIF", value: "gif" },
    { label: "WEBP", value: "webp" },
  ];

  function parseId(url) {
    const product_id = url?.substring(url.lastIndexOf("/") + 1);
    return product_id;
  }

  const productId = modal?.data?.info?.id;

  async function fetchImages() {
    try {
      const response = await fetcher(`/api/product/${parseId(productId)}`);
      const data = await response.json();
      setProductInfoById(data?.images);
      setImages(data?.images); // Store images in context
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching images:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(images || []);

  function parseFilenameFromSrc(url) {
    const full_filename = url?.substring(url.lastIndexOf("/") + 1).split("?")[0];
    const filename_without_extension = full_filename?.substring(0, full_filename?.lastIndexOf("."));
    const fileExtension = full_filename?.substring(full_filename?.lastIndexOf("."));
    return { filename: filename_without_extension, fileExt: fileExtension };
  }

  const handleFieldChange = (value, field) => {
    setCompressionSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedResources?.length === 0) {
      return setToggleToast({
        active: true,
        message: "No images selected.",
      });
    }

    setIsSaving(true);

    const requests = selectedResources.map((imageId) => {
      const image = images?.find((img) => img.id === imageId);
      const imagePosition = image?.position;
      const altText = image?.alt;
      const fileName = parseFilenameFromSrc(image?.src)?.filename;
      if (image) {
        return fetcher(`/api/image-compression/${parseId(productId)}/${imageId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
            compressionSettings,
            replaceOrginalImage,
            imagePosition,
            altText,
            fileName,
          }),
        })
          .then((response) => {
            if (response.status === 200) {
              setToggleToast({
                active: true,
                message: "Image compressed and updated successfully",
              });
            } else {
              setToggleToast({
                active: true,
                message: "Error during image compression",
              });
            }
          })
          .catch((error) => {
            setToggleToast({
              active: true,
              message: "Error during image compression",
            });
          });
      } else {
        setToggleToast({
          active: true,
          message: "Image not found ",
        });
        return Promise.reject("Image not found");
      }
    });

    Promise.all(requests)
      .then(() => {
        // selectedResources.length = 0;
        setIsLoading(true);
        fetchImages();
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const rows = images?.map((image) => ({
    id: image?.id,
    src: image?.src,
    fileExtension: parseFilenameFromSrc(image?.src)?.fileExt?.slice(1),
  }));
  return (
    <Layout>
      <Layout.Section oneHalf>
        <Card title="Images" sectioned>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Spinner size="large" />
            </div>
          ) : (
            <IndexTable
              resourceName={{ singular: "image", plural: "images" }}
              itemCount={rows?.length || 0}
              selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[{ title: "Image" }, { title: "Format" }]}
              selectable
            >
              {rows?.map((row, index) => (
                <IndexTable.Row
                  id={row?.id}
                  key={row?.id}
                  selected={selectedResources?.includes(row?.id)}
                  position={index}
                >
                  <IndexTable.Cell>
                    <img src={row?.src} alt={`Image ${row?.id}`} style={{ width: "50px" }} />
                  </IndexTable.Cell>
                  <IndexTable.Cell>{row?.fileExtension}</IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          )}
        </Card>
      </Layout.Section>

      <Layout.Section oneHalf>
        <Card title="Compression Settings" sectioned>
          <Form onSubmit={handleSubmit}>
            <TextField
              label="Image Width"
              value={compressionSettings.width}
              type="number"
              onChange={(value) => handleFieldChange(value, "width")}
            />
            <TextField
              label="Image Height"
              value={compressionSettings.height}
              type="number"
              onChange={(value) => handleFieldChange(value, "height")}
            />
            <TextField
              label="Image Quality (1-100)"
              value={compressionSettings.quality}
              type="number"
              onChange={(value) => handleFieldChange(value, "quality")}
            />
            <Select
              label="Image Format"
              options={OPTION}
              value={compressionSettings.format}
              onChange={(value) => handleFieldChange(value, "format")}
            />
            <div style={{ marginTop: "1rem", textAlign: "right", display: "flex", justifyContent: "space-between" }}>
              <Checkbox
                label="Replace original image"
                checked={replaceOrginalImage}
                onChange={() => setReplaceOrginalImage((prev) => !prev)}
              />
              <Button primary submit>
                {isSaving ? <Spinner size="small" /> : "Save"}
              </Button>
            </div>
          </Form>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
