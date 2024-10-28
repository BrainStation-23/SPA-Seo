import { useState, useCallback } from "react";
import {
  Box,
  Text,
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  HorizontalStack,
  Thumbnail,
  VerticalStack,
  Tag,
  Select,
  Spinner,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useCreateMetafield } from "../hooks/useMetafieldQuery";
import StarRating from "./commonUI/StarRating/StarRating";
import Switch from "./commonUI/Switch/Switch";

export function GenerateJsonld({ obj_type }) {
  const [isLoading, setIsLoading] = useState(false);
  const { modal, shop } = useUI();
  const owner = modal?.data?.info;
  const images =
    obj_type?.toLowerCase() == "product"
      ? owner?.images.edges.map((e) => e.node)
      : obj_type?.toLowerCase() == "collection" && owner?.image
      ? [owner?.image]
      : obj_type?.toLowerCase() == "article" && owner?.image
      ? [owner?.image]
      : null;
  const metaData = owner?.metafield ? JSON.parse(owner?.metafield?.value) : null;
  const ownerMetaData = metaData?.[`${obj_type?.toLowerCase()}`] || null;

  const invalidationTarget =
    obj_type?.toLowerCase() == "product"
      ? "productList"
      : obj_type?.toLowerCase() == "collection"
      ? "collectionList"
      : "metafieldList";
  const { mutate: createMetafield } = useCreateMetafield(invalidationTarget);

  const [pushJson, setPushJson] = useState(metaData?.active || false);
  const [showTags, setShowTags] = useState(ownerMetaData?.showTags || false);
  const [rating, setRating] = useState(ownerMetaData?.rating || 0);
  const [showVarinats, setShowVariants] = useState(ownerMetaData?.showVarinats | false);
  const [reviewCount, setReviewCount] = useState(ownerMetaData?.reviewCount || 0);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [keywords, setKeywords] = useState(ownerMetaData?.keywords?.split(",") || []);
  const [audiance, setAudience] = useState(null);
  const [authorUrl, setAuthorUrl] = useState(null);
  const [additionalAuthors, setAdditionalAuthors] = useState([]);
  const [additionalAuthorName, setAdditionalAuthorName] = useState(null);
  const [additionalAuthorUrl, setAdditionalAuthorUrl] = useState(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(() => {
    console.log("rating", rating);
    console.log("reviewCount", reviewCount);

    if (reviewCount == 0 || rating == 0) {
      return setErrors({
        ...errors,
        message: `Value must be getter then 5`,
      });
    }
    if (rating > 5 || rating < 0) {
      return setErrors({
        ...errors,
        message: `Rating must be between 0 and 5`,
      });
    }
    if (rating == 0 && reviewCount != 0) {
      return setErrors({
        ...errors,
        message: `Please enter rating count`,
      });
    }
    setIsLoading(true);
    createMetafield(
      {
        type: obj_type.toLowerCase(),
        owner: obj_type.toUpperCase(),
        ownerId: owner?.id,
        active: pushJson,
        blogId: owner?.blog_id || null,
        data: {
          showTags,
          showVarinats: showVarinats,
          rating: rating,
          reviewCount: reviewCount,
          keywords: keywords.join(","),
          audienceType: audiance || null,
          authorUrl: authorUrl || null,
          additionalAuthors: additionalAuthors.length > 0 ? additionalAuthors : null,
        },
      },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      }
    );
  }, [rating, reviewCount, showTags, owner, pushJson, keywords, showVarinats, audiance, authorUrl, additionalAuthors]);

  const handleShowTagsChange = useCallback((value) => setShowTags(value), []);
  const handleRatingChange = useCallback((value) => {
    setRating(value);
    setErrors({ ...errors, message: "" });
  }, []);
  const handlePushJsonChange = () => setPushJson((prev) => !prev);
  const handleShowVariantsChange = () => setShowVariants((prev) => !prev);
  const handleKeywordsChange = useCallback((value) => setKeywordsInput(value), []);
  const handleReviewCountChange = useCallback((value) => {
    setReviewCount(value);
    setErrors({ ...errors, message: "" });
  }, []);

  const handleRemoveKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };
  const handleAddKeyword = (val) => {
    setKeywords([...keywords, val]);
  };
  const handleStarClick = (value) => {
    setRating(value);
  };
  const handleAudienceChange = (value) => {
    setAudience(value);
  };
  const handleAuthorUrlChange = useCallback((value) => setAuthorUrl(value), []);
  const handleAdditionalAuthorNamneChange = useCallback((value) => setAdditionalAuthorName(value), []);
  const handleAdditionalAuthorUrlChange = useCallback((value) => setAdditionalAuthorUrl(value), []);

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
    <Box paddingBlockStart={"2"}>
      <HorizontalStack align="space-between" ali>
        <Text variant="headingMd">{obj_type} information for Jsonld</Text>
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
      </HorizontalStack>
      <Box paddingBlockStart={"4"}>
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField value={owner?.title} disabled label="Title" type="text" />
            {images && images.length > 0 && (
              <VerticalStack gap={"2"}>
                <Text>Images</Text>
                <HorizontalStack gap={"3"}>
                  {images.map((img) => (
                    <Thumbnail source={img?.url ? img?.url : img?.src} />
                  ))}
                </HorizontalStack>
              </VerticalStack>
            )}
            {obj_type?.toLowerCase() != "article" && (
              <TextField
                value={owner?.description}
                disabled
                multiline={2}
                label={`${obj_type} description`}
                type="text"
              />
            )}
            {obj_type?.toLowerCase() == "article" && (
              <TextField
                value={authorUrl}
                label="Author information"
                type="text"
                placeholder="A link to a web page that uniquely identifies the author of the article"
                onChange={handleAuthorUrlChange}
                connectedLeft={<TextField disabled value={owner?.author} type="text" />}
              />
            )}
            {additionalAuthors.map((auth, index) => (
              <TextField
                value={auth.url}
                type="text"
                disabled
                placeholder="A link to a web page that uniquely identifies the author of the article"
                connectedLeft={<TextField disabled value={auth.name} type="text" />}
                connectedRight={
                  <Button
                    destructive
                    onClick={() => {
                      setAdditionalAuthors((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </Button>
                }
              />
            ))}
            {obj_type?.toLowerCase() == "article" && (
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
                    d
                  />
                }
                connectedRight={
                  <Button
                    primary
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
            )}
            {obj_type?.toLowerCase() == "article" && (
              <Select label="Set audience type" options={options} onChange={handleAudienceChange} value={audiance} />
            )}
            {obj_type.toLowerCase() == "product" && (
              <TextField label={`Vendor`} type="text" disabled value={owner?.vendor} />
            )}
            {obj_type.toLowerCase() == "collection" && (
              <VerticalStack gap={"3"}>
                <TextField
                  value={keywordsInput}
                  onChange={handleKeywordsChange}
                  label={`Keywords`}
                  type="text"
                  connectedRight={
                    keywordsInput &&
                    keywordsInput.length > 0 && (
                      <Button
                        primary
                        onClick={() => {
                          if (keywordsInput.length > 0) {
                            handleAddKeyword(keywordsInput);
                            setKeywordsInput("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    )
                  }
                />
                <HorizontalStack gap={"2"}>
                  {keywords &&
                    keywords.length > 0 &&
                    keywords.map((k, index) => (
                      <Tag key={index} onRemove={() => handleRemoveKeyword(index)}>
                        {k}
                      </Tag>
                    ))}
                </HorizontalStack>
              </VerticalStack>
            )}
            {obj_type.toLowerCase() == "product" && (
              <div
                style={{
                  display: "flex",
                  gap: "0.21rem",
                  flexDirection: "column",
                }}
              >
                <Text variant="bodyMd">Show all variants data</Text>
                <Switch checked={showVarinats} handleClick={handleShowVariantsChange} />
                <Text variant="bodySm">
                  This shows all vairants data on your jsonld. If turned off the jsonld will only show the data for
                  default variant.
                </Text>
              </div>
            )}
            {obj_type.toLowerCase() == "product" && (
              <HorizontalStack gap={"4"} blockAlign="center">
                <TextField
                  value={rating}
                  onChange={handleRatingChange}
                  label="Aggregated rating"
                  type="number"
                  max={5}
                  min={0}
                  error={errors?.message}
                />
                <StarRating size={30} rating={rating} onRate={handleStarClick} />
              </HorizontalStack>
            )}
            {obj_type.toLowerCase() == "product" && (
              <TextField
                value={reviewCount}
                onChange={handleReviewCountChange}
                label={`Review count`}
                type="integer"
                min={0}
                error={errors?.message}
              />
            )}
            {obj_type.toLowerCase() == "product" ||
              (obj_type.toLowerCase() == "article" && (
                <Checkbox
                  label={`Show ${obj_type.toLowerCase()} tag information`}
                  checked={showTags}
                  onChange={handleShowTagsChange}
                />
              ))}
            <HorizontalStack align="end">
              <Button primary submit disabled={isLoading}>
                {isLoading ? <Spinner size="small" /> : "Save"}
              </Button>
            </HorizontalStack>
          </FormLayout>
        </Form>
      </Box>
    </Box>
  );
}
