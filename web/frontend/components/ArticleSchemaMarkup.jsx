import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Text,
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  InlineStack,
  Thumbnail,
  BlockStack,
  Tag,
  Select,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useCreateMetafield } from "../hooks/useMetafieldQuery";
import { useSingleArticleQuery } from "../hooks/useBlogsQuery";
import Switch from "./commonUI/Switch/Switch";
import { Spinners } from "./Spinner";

export function ArticleSchemaMarkup() {
  const { modal } = useUI();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { data, isSuccess, isLoading } = useSingleArticleQuery({
    url: `/api/blog/articleById/${modal?.data?.info?.blog_id}/${modal?.data?.info?.id}`,
  });
  const owner = modal?.data?.info;
  const images = owner?.image ? [owner?.image] : null;

  const invalidationTarget = "singleArticle";
  const { mutate: createMetafield } = useCreateMetafield(invalidationTarget);

  const [pushJson, setPushJson] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [authorUrl, setAuthorUrl] = useState(null);
  const [additionalAuthors, setAdditionalAuthors] = useState([]);
  const [audiance, setAudience] = useState("General");
  const [showComments, setShowComments] = useState(false);
  const [additionalAuthorName, setAdditionalAuthorName] = useState(null);
  const [additionalAuthorUrl, setAdditionalAuthorUrl] = useState(null);

  useEffect(() => {
    const metaData = data?.metafields
      ? JSON.parse(data?.metafields.value)
      : null;
    const ownerMetaData = metaData?.article || null;

    setPushJson(metaData?.active);
    setShowTags(ownerMetaData?.showTags);
    setAuthorUrl(ownerMetaData?.authorUrl);
    setAdditionalAuthors(ownerMetaData?.additionalAuthors || []);
    setAudience(ownerMetaData?.audienceType);
    setShowComments(ownerMetaData?.showComments);
  }, [isSuccess]);

  const handleSubmit = useCallback(() => {
    if (authorUrl?.length && additionalAuthors?.length == 0) {
      return setErrors({
        ...errors,
        message: `Please add additional authors Name`,
      });
    }
    setLoading(true);
    createMetafield(
      {
        type: "article",
        owner: "ARTICLE",
        ownerId: owner?.id,
        active: pushJson,
        blogId: owner?.blog_id || null,
        data: {
          showTags,
          audienceType: audiance || null,
          authorUrl: authorUrl || null,
          showComments,
          additionalAuthors:
            additionalAuthors?.length > 0 ? additionalAuthors : [],
        },
      },
      {
        onSuccess: () => {
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  }, [
    showTags,
    owner,
    pushJson,
    audiance,
    authorUrl,
    showComments,
    additionalAuthors,
  ]);

  const handleShowTagsChange = useCallback((value) => setShowTags(value), []);
  const handlePushJsonChange = () => setPushJson((prev) => !prev);
  const handleShowCommentsChange = () => setShowComments((prev) => !prev);
  const handleAudienceChange = (value) => {
    setAudience(value);
  };
  const handleAuthorUrlChange = useCallback((value) => setAuthorUrl(value), []);
  const handleAdditionalAuthorNamneChange = useCallback((value) => {
    setAdditionalAuthorName(value), setErrors({ ...errors, message: "" });
  }, []);
  const handleAdditionalAuthorUrlChange = useCallback(
    (value) => setAdditionalAuthorUrl(value),
    []
  );

  const options = [
    { label: "General", value: "General" },
    { label: "Children", value: "Children" },
    { label: "Teens", value: "Teens" },
    { label: "Adults", value: "Adults" },
    { label: "Seniors", value: "Seniors" },
    { label: "Students", value: "Students" },
    { label: "Professionals", value: "Professionals" },
    { label: "Researchers", value: "Researchers" },
    { label: "Parents", value: "Parents" },
    { label: "Teachers", value: "Teachers" },
    { label: "Business", value: "Business" },
    { label: "Technologists", value: "Technologists" },
    { label: "Health Enthusiasts", value: "HealthEnthusiasts" },
    { label: "Travelers", value: "Travelers" },
    { label: "Hobbyists", value: "Hobbyists" },
    { label: "Gamers", value: "Gamers" },
    { label: "Fitness Enthusiasts", value: "FitnessEnthusiasts" },
  ];

  return (
    <>
      {isLoading ? (
        <Spinners />
      ) : (
        <Box paddingBlockStart={"2"}>
          <InlineStack align="space-between" ali>
            <Text variant="headingMd">Article information for Jsonld</Text>
            <div
              style={{
                display: "flex",
                gap: "0.21rem",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Text variant="headingSm">Status</Text>
              <Switch checked={pushJson} handleClick={handlePushJsonChange} />
            </div>
          </InlineStack>
          <Box paddingBlockStart={"4"}>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={owner?.title}
                  disabled
                  label="Title"
                  type="text"
                />
                {images && images.length > 0 && (
                  <BlockStack gap={"2"}>
                    <Text>Images</Text>
                    <InlineStack gap={"3"}>
                      {images.map((img) => (
                        <Thumbnail source={img?.url ? img?.url : img?.src} />
                      ))}
                    </InlineStack>
                  </BlockStack>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.21rem",
                    flexDirection: "column",
                  }}
                >
                  <Text variant="bodyMd">Show all comments data</Text>
                  <Switch
                    checked={showComments}
                    handleClick={handleShowCommentsChange}
                  />
                  <Text variant="bodySm">
                    This shows all comments data on your jsonld.
                  </Text>
                </div>

                <TextField
                  value={authorUrl}
                  label="Author information"
                  type="text"
                  placeholder="A link to a web page that uniquely identifies the author of the article"
                  onChange={handleAuthorUrlChange}
                  connectedLeft={
                    <TextField disabled value={owner?.author} type="text" />
                  }
                />
                {additionalAuthors?.map((auth, index) => (
                  <TextField
                    value={auth.url}
                    type="text"
                    disabled
                    placeholder="A link to a web page that uniquely identifies the author of the article"
                    connectedLeft={
                      <TextField disabled value={auth.name} type="text" />
                    }
                    connectedRight={
                      <Button
                        destructive
                        onClick={() => {
                          setAdditionalAuthors((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    }
                  />
                ))}
                <TextField
                  value={additionalAuthorUrl}
                  label="Add additional author information"
                  type="text"
                  placeholder="A link to a web page that uniquely identifies the author of the article"
                  onChange={handleAdditionalAuthorUrlChange}
                  connectedLeft={
                    <TextField
                      value={additionalAuthorName}
                      placeholder="Author name"
                      type="text"
                      onChange={handleAdditionalAuthorNamneChange}
                      error={errors?.message}
                    />
                  }
                  connectedRight={
                    <Button
                      primary
                      disabled={
                        !(
                          additionalAuthorName &&
                          additionalAuthorName.length > 0
                        )
                      }
                      onClick={() => {
                        setAdditionalAuthors((prev) => [
                          ...prev,
                          {
                            name: additionalAuthorName,
                            url: additionalAuthorUrl,
                          },
                        ]);
                        setAdditionalAuthorName(null);
                        setAdditionalAuthorUrl(null);
                      }}
                    >
                      Add
                    </Button>
                  }
                />
                <Select
                  label="Set audience type"
                  options={options}
                  onChange={handleAudienceChange}
                  value={audiance}
                />
                <Checkbox
                  label={`Show article tag information`}
                  checked={showTags}
                  onChange={handleShowTagsChange}
                />
                <InlineStack align="end">
                  <Button primary submit disabled={loading}>
                    {loading ? <Spinners /> : "Save"}
                  </Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </Box>
        </Box>
      )}
    </>
  );
}
