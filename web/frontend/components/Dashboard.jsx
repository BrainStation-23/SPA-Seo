import React, { useState } from "react";
import { useShopQuery } from "../hooks";
import Sidebar from "./Sidebar";
import Product from "./Product";
import HomeSeo from "./HomeSeo";
import ProductBulkUpdate from "./ProductBulkUpdate";
import CollectionsPage from "./Collections";
import CollectionBulkUpdate from "./CollectionBulkUpdate";
import CompanyProfile from "./CompanyProfile";
import { useMetafieldsQuery } from "../hooks/useMetafieldQuery";
import { PageSpeedInsights } from "./SeoScore";
import BlogPage from "./Blog";
import { ImageAltOptimizer } from "./ImageOptimizer";
import { ErrorInsights } from "./ErrorInsights";
import { useCreateGlobalFileSeo } from "../hooks/useHomeSEOQuery";

export function Dashboard() {
  useShopQuery({
    url: "/api/shop",
  });
  useCreateGlobalFileSeo({ url: "/api/home/create-seo-file" });
  useMetafieldsQuery({ url: "/api/metafields" });

  const [selectedSidebar, setSelectedSidebar] = useState(1);

  return (
    <>
      <div className="app__container">
        <Sidebar
          selectedSidebar={selectedSidebar}
          setSelectedSidebar={setSelectedSidebar}
        />
        <div className="app__dashboard_container">
          {selectedSidebar === 1 && <PageSpeedInsights />}
          {selectedSidebar === 2 && <HomeSeo />}
          {selectedSidebar === 3 && <Product />}
          {selectedSidebar === 4 && <ProductBulkUpdate />}
          {selectedSidebar === 5 && <CollectionsPage />}
          {selectedSidebar === 6 && <CollectionBulkUpdate />}
          {selectedSidebar === 7 && <CompanyProfile />}
          {selectedSidebar === 8 && <BlogPage />}
          {selectedSidebar === 9 && <ImageAltOptimizer />}
          {selectedSidebar === 10 && <ErrorInsights />}
        </div>
      </div>
    </>
  );
}
