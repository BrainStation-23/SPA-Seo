import React, { useState } from "react";
import {
  Button,
  Form,
  TextField,
  Checkbox,
  Layout,
  Card,
  Select,
  IndexTable,
  useIndexResourceState,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
// import { compressImages } from "../../controllers/imageCompression";

export function ImageCompression() {
  const fetcher = useAuthenticatedFetch();
  const { modal, setToggleToast } = useUI();
  // console.log("modal", modal.data.info.id);
  // const productId = modal?.data?.info?.id;
  function parsId(url) {
    const product_id = url?.substring(url.lastIndexOf("/") + 1);
    return product_id;
  }
  const productId = modal?.data?.info?.id;

  console.log("productId", productId);

  const images = modal?.data?.info?.images?.edges?.map((data) => data?.node);

  const [compressionSettings, setCompressionSettings] = useState({
    width: "",
    height: "",
    quality: 80,
    format: "jpg",
  });

  const OPTION = [
    { label: "JPG", value: "jpg" },
    { label: "JPEG", value: "jpeg" },
    { label: "PNG", value: "png" },
    { label: "GIF", value: "gif" },
    { label: "WEBP", value: "webp" },
  ];

  const resourceName = {
    singular: "image",
    plural: "images",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(images || []);

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

    selectedResources.forEach((imageId) => {
      const image = images.find((img) => img.id === imageId);

      if (image) {
        fetcher(`/api/product/update-image/${parsId(productId)}/${parsId(imageId)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
            compressionSettings,
          }),
        })
          .then((response) => {
            console.log("response", response);
          })
          .catch((error) => {
            console.log("error", error);
          });
      }
    });
  };

  console.log("selectedResources", selectedResources);
  console.log("allResourcesSelected", allResourcesSelected);
  console.log("images", images);
  console.log("compressionSettings", compressionSettings);

  function parseFilenameFromSrc(url) {
    const full_filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    const filename_without_extension = full_filename.substring(0, full_filename.lastIndexOf("."));
    const fileExtension = full_filename.substring(full_filename.lastIndexOf("."));
    return { filename: filename_without_extension, fileExt: fileExtension };
  }

  const rows = images?.map((image) => ({
    id: image.id,
    imageSrc: image.originalSrc,
    fileExtension: parseFilenameFromSrc(image?.url).fileExt.slice(1),
  }));

  return (
    <Layout>
      <Layout.Section oneHalf>
        <Card title="Images" sectioned>
          <IndexTable
            resourceName={resourceName}
            itemCount={rows?.length || 0}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[{ title: "Image" }, { title: "Format" }]}
            selectable
          >
            {rows?.map((row, index) => (
              <IndexTable.Row id={row.id} key={row.id} selected={selectedResources.includes(row.id)} position={index}>
                <IndexTable.Cell>
                  <img src={row.imageSrc} alt={`Image ${row.id}`} style={{ width: "50px" }} />
                </IndexTable.Cell>
                <IndexTable.Cell>{row.fileExtension}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
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
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <Button primary submit>
                Save
              </Button>
            </div>
          </Form>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
