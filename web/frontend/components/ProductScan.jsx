import React from "react";
import { useUI } from "../contexts/ui.context";

export function ProductScan() {
  const { modal, shop } = useUI();
  const product = modal?.data?.info;
  const images = modal?.data?.info?.media?.edges?.map((data) => {
    const node = data?.node;
    return {
      node: {
        id: node.id,
        url: node.preview.image.url,
        altText: node.alt,
        originalSrc: node.preview.image.url,
      },
    };
  });
  const productUrl = `https://${shop?.domain}/products/${product?.handle}`;
  const metaTitle = product?.seo?.title;
  const metaDescription = product?.seo?.description;

  const isSEOFriendlyUrl = (url) => {
    const urlLength = url.length;
    const containsSpecialChars = /[!@#$%^&*()_+={}|:"<>?]/.test(url);
    const containsUnderscore = /_/.test(url);
    const containsUppercase = /[A-Z]/.test(url);
    const endsWithSlash = url.endsWith("/");

    let errors = [];

    // Rule 1: Check URL length
    if (urlLength > 60) {
      errors.push(
        "URL is too long. Keep it under 60 characters for better SEO."
      );
    }

    // Rule 2: Check for special characters
    if (containsSpecialChars) {
      errors.push(
        "URL contains special characters. Use only alphanumeric characters and hyphens."
      );
    }

    // Rule 3: Check for underscores
    if (containsUnderscore) {
      errors.push(
        "URL contains underscores. Use hyphens instead of underscores."
      );
    }

    // Rule 4: Check for uppercase letters
    if (containsUppercase) {
      errors.push(
        "URL contains uppercase letters. Use lowercase letters for better SEO."
      );
    }

    // Rule 5: Check if URL ends with a slash
    if (endsWithSlash) {
      errors.push(
        "URL ends with a trailing slash. Avoid trailing slashes in SEO-friendly URLs."
      );
    }

    return errors;
  };

  const seoErrors = isSEOFriendlyUrl(productUrl);

  return (
    <div className="seo_scan_page">
      <div className="seo_scan_meta_info">
        <div className="seo_scan_product_section">
          <div className="seo_scan_product_meta">Meta Title</div>
          <div className="seo_scan_product_meta_data">
            <div className="seo_scan_product_title_suggestion">
              {metaTitle?.length == 0 && (
                <p style={{ color: "red" }}>Meta title Not Found</p>
              )}
              {metaTitle?.length < 50 && metaTitle?.length > 0 && (
                <p style={{ color: "red" }}>
                  Meta title is too short. Aim for at least 50 characters.
                </p>
              )}
              {metaTitle?.length > 60 && (
                <p style={{ color: "red" }}>
                  Meta title is too long. Try to keep it under 60 characters.
                </p>
              )}
              {!metaTitle
                ?.toLowerCase()
                ?.includes(product?.title?.toLowerCase()) && (
                <p style={{ color: "red" }}>
                  Consider including the product name for better SEO.
                </p>
              )}
            </div>
            <div>{product?.seo?.title}</div>
          </div>
        </div>
        <div className="seo_scan_product_section">
          <div className="seo_scan_product_meta">Meta Description</div>
          <div className="seo_scan_product_meta_data">
            <div className="seo_scan_product_title_suggestion">
              {metaDescription?.length == 0 && (
                <p style={{ color: "red" }}>Meta description Not Found</p>
              )}
              {metaDescription?.length < 50 && metaDescription?.length > 0 && (
                <p style={{ color: "red" }}>
                  Meta description is too short. Aim for at least 50 characters.
                </p>
              )}
              {metaDescription?.length > 160 && (
                <p style={{ color: "red" }}>
                  Meta description is too long. Try to keep it under 160
                  characters.
                </p>
              )}
              {!metaDescription
                ?.toLowerCase()
                ?.includes(product?.title?.toLowerCase()) && (
                <p style={{ color: "red" }}>
                  Consider including the product name for better SEO.
                </p>
              )}
              {!metaDescription?.toLowerCase().includes("buy") &&
                !metaDescription?.toLowerCase().includes("shop") && (
                  <p style={{ color: "red" }}>
                    Consider adding a call-to-action, such as 'Buy now' or 'Shop
                    today,' to improve engagement.
                  </p>
                )}
            </div>
            <div>{metaDescription}</div>
          </div>
        </div>
      </div>
      <div className="seo_scan_meta_info">
        {images?.map((data) => (
          <div className="seo_scan_product_section" key={data?.node?.id}>
            <div className="seo_scan_product_meta items_center">
              <div className="app__product_alt_image-smaller">
                <img src={data?.node?.url} alt={data?.node?.altText} />
              </div>
            </div>
            <div className="seo_scan_product_meta_data">
              <div className="seo_scan_product_title_suggestion">
                {/* Alt text validation for better SEO */}
                {!data?.node?.altText && (
                  <p style={{ color: "red" }}>
                    Image is missing alt text. Please add alt text for better
                    SEO.
                  </p>
                )}

                {data?.node?.altText && data?.node?.altText?.length < 10 && (
                  <p style={{ color: "red" }}>
                    Alt text is too short. Aim for descriptive alt text with at
                    least 10 characters for better SEO.
                  </p>
                )}

                {/* Image URL validation */}
                {!data?.node?.url && (
                  <p style={{ color: "red" }}>
                    Image source URL is missing. Ensure your image is properly
                    linked.
                  </p>
                )}
              </div>
              <div>{data?.node?.altText}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="seo_scan_meta_info">
        <div className="seo_scan_product_title_suggestion">
          Product URL: {productUrl}
        </div>

        {/* Display SEO errors if there are any */}
        {seoErrors?.length > 0 && (
          <div style={{ color: "red" }}>
            <p>SEO Issues with the URL:</p>
            <ul>
              {seoErrors?.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
