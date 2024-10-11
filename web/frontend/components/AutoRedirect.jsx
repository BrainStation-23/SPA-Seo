import React, { useEffect, useState } from "react";
import { Button, Form, InlineError } from "@shopify/polaris";
import { InputField } from "./commonUI/InputField";
import {
  useAutoRedirectQuery,
  useCreateAutoRedirect,
  useUpdateAutoRedirect,
} from "../hooks/useErrorInsightsQuery";

export function AutoRedirect() {
  const [editOptions, setEditOptions] = useState({
    title: "Add auto redirect",
    isEdit: false,
  });
  const { data } = useAutoRedirectQuery({
    url: "/api/error/auto-redirect/list",
  });

  const {
    mutate: createAutoRedirect,
    isError,
    isSuccess: isCreateSuccess,
  } = useCreateAutoRedirect();
  const { mutate: updateAutoRedirect, isSuccess } = useUpdateAutoRedirect();

  const [formData, setFormData] = useState({
    path: "",
    target: "",
  });

  const [errors, setErrors] = useState({
    path: "",
    target: "",
  });

  const handleSubmit = (obj) => {
    if (!obj?.path) {
      return setErrors({
        ...errors,
        path: `Please enter path`,
      });
    } else if (!obj?.target) {
      return setErrors({
        ...errors,
        target: `Please enter target`,
      });
    }

    if (editOptions?.isEdit) {
      const info = {
        path: obj?.path,
        target: obj?.target,
        id: editOptions?.id,
      };
      updateAutoRedirect(info);
    } else {
      const info = {
        path: obj?.path,
        target: obj?.target,
      };
      createAutoRedirect(info);
    }
  };

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    if (isSuccess) {
      setEditOptions({
        title: `Add auto redirect`,
        isEdit: false,
        id: null,
      });
      setFormData({
        path: "",
        target: "",
      });
    }

    if (isCreateSuccess) {
      setFormData({
        path: "",
        target: "",
      });
    }
  }, [isSuccess, isCreateSuccess]);

  return (
    <div className="seo_auto_redirect_page">
      <div className="seo_auto_redirect_form_container">
        <div className="seo_auto_redirect_list_title_container">
          <label className="seo_auto_redirect_list_title">
            {editOptions?.title}
          </label>
          {editOptions?.isEdit && (
            <label
              className="seo_auto_redirect_reset"
              onClick={() => {
                setEditOptions({
                  title: `Add auto redirect`,
                  isEdit: false,
                  id: null,
                });
                setFormData({
                  path: "",
                  target: "",
                });
              }}
            >
              Reset
            </label>
          )}
        </div>
        {isError && <InlineError message={"Something went wrong"} />}
        <Form onSubmit={() => handleSubmit(formData)}>
          <div className="seo_auto_redirect_form">
            <InputField
              value={formData?.path}
              onChange={handleChange}
              label={"Enter path"}
              type="text"
              name="path"
              placeholder={"/example"}
              error={errors?.path}
            />
            <InputField
              value={formData?.target}
              onChange={handleChange}
              label={"Enter target"}
              type="text"
              name="target"
              placeholder={"/example"}
              error={errors?.target}
            />
            <div className="seo_auto_redirect_button">
              <Button primary submit>
                Submit
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <div className="seo_auto_redirect_list_container">
        <div className="seo_auto_redirect_list_title">Redirect List</div>
        <div>
          <div className="seo_auto_redirect_item">
            <div className="bold_title">Path</div>
            <div className="bold_title">Target</div>
            <div className="bold_title">Action</div>
          </div>
          {data?.redirectList?.map((list) => (
            <div className="seo_auto_redirect_item">
              <div>{list?.path}</div>
              <div>{list?.target}</div>
              <Button
                className="cursor_pointer"
                primary
                onClick={(e) => {
                  setFormData({
                    path: list?.path,
                    target: list?.target,
                  });
                  setEditOptions({
                    title: `Edit path ${list?.path} target ${list?.target}`,
                    isEdit: true,
                    id: list?.id,
                  });
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
