import React, { useState } from "react";
import { useShopQuery } from "../hooks";
import Sidebar from "./Sidebar";
import Product from "./Product";
import HomeSeo from "./HomeSeo";
import ProductBulkUpdate from "./ProductBulkUpdate";
import CollectionsPage from "./Collections";
import CollectionBulkUpdate from "./CollectionBulkUpdate";
import { PageSpeedInsights } from "./SeoScore";

export function Dashboard() {
  useShopQuery({
    url: "/api/shop",
  });

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
        </div>
      </div>
    </>
  );
}
