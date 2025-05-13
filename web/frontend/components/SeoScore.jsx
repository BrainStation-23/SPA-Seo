import React from "react";
import { useSeoInsightsQuery, useSeoLeazyLoaddingQuery } from "../hooks/useShopQuery";
import { SkeletonBodyText, Button } from "@shopify/polaris";

export function PageSpeedInsights() {
  const { data, isLoading } = useSeoInsightsQuery({ url: "api/seo/insights" });

  console.log("🚀 ~ lazyLoadingData:", lazyLoadingData);
  return (
    <div className="app__seo_score_container">
      <>
        <div className="seo_score_page_title_container">
          <div>
            <div className="seo_score_page_title">SEO Insights</div>
            <p className="seo_score_page_description">
              SEO Insights is a powerful tool designed to optimize website performance, providing a detailed assessment
              of your site based on Google's key evaluation criteria
            </p>
          </div>
         
        </div>
        {isLoading ? (
          <SkeletonBodyText lines={20} />
        ) : (
          <div className="seo_score_container_grid">
            {data?.map((seoInfo, index) => (
              <div className="seo_score_container" key={index}>
                <div className="seo_score_title">{seoInfo?.page} SEO Performance Score</div>
                <div
                  style={{
                    backgroundColor: seoInfo?.seoScore >= 90 ? "#0c6" : seoInfo?.seoScore >= 50 ? "#fa3" : "#f33",
                  }}
                  className="seo_score_result_container"
                >
                  <div className="seo_score_result">{seoInfo?.seoScore}</div>
                </div>
                <div>
                  <a
                    href={`https://developers.google.com/speed/pagespeed/insights/?url=${seoInfo?.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="seo_score_insights_url"
                  >
                    View insights
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    </div>
  );
}
