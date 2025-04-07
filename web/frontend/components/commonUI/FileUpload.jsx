import { DropZone, LegacyStack, Thumbnail, Text } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

export function FileUpload({ file, setFile, handleUpload }) {
  //   const [file, setFile] = useState("");

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFile(acceptedFiles[0]);
      handleUpload(acceptedFiles[0]);
    },
    []
  );

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (
    <LegacyStack>
      <Thumbnail
        size="small"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteIcon
        }
      />
      <div>
        {file.name}{" "}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

  return (
    <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
      {uploadedFile}
      {fileUpload}
    </DropZone>
  );
}
