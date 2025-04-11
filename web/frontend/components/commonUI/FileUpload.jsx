import { DropZone, Spinner } from "@shopify/polaris";
import { useCallback } from "react";

export function FileUpload({ file, setFile, handleUpload, isBlogLoading }) {
  //   const [file, setFile] = useState("");

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFile(acceptedFiles[0]);
      handleUpload(acceptedFiles[0]);
    },
    []
  );

  const fileUpload = <DropZone.FileUpload />;

  return (
    <>
      {isBlogLoading ? (
        <Spinner size="large" />
      ) : (
        <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
          {fileUpload}
        </DropZone>
      )}
    </>
  );
}
