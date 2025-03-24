import { Grid, Button, EmptyState, Spinner } from "@shopify/polaris";
import { SingleChoiceList } from "./commonUI/ChoiceList";
import { Selection } from "./commonUI/Selection";
import { InputField } from "./commonUI/InputField";
import TrixEditor from "./TrixEditor";
import { useCallback, useEffect, useState } from "react";
import { useUI } from "../contexts/ui.context";
import { useCreateAIBasedBlogSeo } from "../hooks/useAIQuery";

export default function CreateBlog() {
  const [content, setContent] = useState(
    "<p>Hello man this the best thing writing here...</p>"
  );
  const {
    mutate: createAIBlog,
    isError,
    isLoading,
    data,
  } = useCreateAIBasedBlogSeo();

  const { modal } = useUI();
  const [formData, setFormData] = useState({
    blog_topic: "",
    keywords: "",
    visibility: ["hidden"],
    language: "english",
    blog_tone: "informal",
    post_length: "short",
    blog_ID: "",
  });
  const [errors, setErrors] = useState({
    blog_topic: "",
    keywords: "",
    visibility: "",
    language: "",
    blog_tone: "",
    post_length: "",
    blog_ID: "",
  });

  const handleChange = useCallback((value, name) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  }, []);

  const modalList = modal?.data?.blogList?.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });

  const onSubmit = useCallback((obj) => {
    if (!obj?.blog_topic) {
      return setErrors({
        ...errors,
        blog_topic: `Please enter Blog topic`,
      });
    }
    createAIBlog(obj);
  }, []);

  useEffect(() => {
    if (modal?.data?.blogList?.length) {
      setFormData({ ...formData, blog_ID: modal?.data?.blogList?.[0].id });
    }
  }, [modal?.data?.blogList]);

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 4 }}>
        <div className="card_container">
          <div className="card_content_container">
            <SingleChoiceList
              name="visibility"
              selected={formData?.visibility}
              handleSelect={handleChange}
              choices={[
                { label: "Hidden", value: "hidden" },
                { label: "Visible", value: "visible" },
              ]}
            />
          </div>
          <div className="card_content_container">
            <div className="card_container">
              <Selection
                label="Language"
                options={[
                  { label: "English", value: "english" },
                  { label: "Germany", value: "germany" },
                  { label: "French", value: "french" },
                ]}
                selected={formData?.language}
                handleChange={handleChange}
                name="language"
              />
              <InputField
                label="Post Topic"
                placeholder={"What’s this blog post about?"}
                value={formData?.blog_topic}
                onChange={handleChange}
                type="text"
                name="blog_topic"
                error={errors?.blog_topic}
              />
              <Selection
                label="Blog"
                options={modalList || []}
                selected={formData?.blog_ID}
                handleChange={handleChange}
                name="blog_ID"
              />
              <Selection
                label="Tone"
                options={[
                  { label: "Informal", value: "informal" },
                  { label: "Professional", value: "professional" },
                  { label: "Persuasive", value: "persuasive" },
                  { label: "Informative", value: "informative" },
                  { label: "Humorous", value: "humorous" },
                  { label: "Friendly", value: "friendly" },
                ]}
                selected={formData?.blog_tone}
                handleChange={handleChange}
                name="blog_tone"
              />
              <Selection
                label="Post Length"
                options={[
                  { label: "Short", value: "short" },
                  { label: "Medium", value: "medium" },
                  { label: "Long", value: "Long" },
                ]}
                selected={formData?.post_length}
                handleChange={handleChange}
                name="post_length"
              />
              <InputField
                label={"Keywords"}
                placeholder={"Keywords"}
                value={formData?.keywords}
                onChange={handleChange}
                type="text"
                name="keywords"
              />
              <Button primary onClick={() => onSubmit(formData)}>
                Generate blog post
              </Button>
            </div>
          </div>
        </div>
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 8 }}>
        <div className="card_content_container blog_generate_container">
          {isLoading ? (
            <Spinner size="large" />
          ) : (
            <>
              {!data ? (
                <EmptyState
                  heading="Generate Blog Post"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                ></EmptyState>
              ) : (
                <div className="card_container">
                  <div className="blog_generate_AI_update_button">
                    <Button destructive onClick={() => onSubmit(formData)}>
                      Update Blog Post
                    </Button>
                  </div>
                  <InputField label={"Title"} placeholder={"Title"} />
                  <div className="blog_generate_AI_update_button">
                    <Button plain onClick={() => onSubmit(formData)}>
                      Re-generate title
                    </Button>
                  </div>
                  <TrixEditor value={content} onChange={setContent} />
                </div>
              )}
            </>
          )}
        </div>
      </Grid.Cell>
    </Grid>
  );
}
