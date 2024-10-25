import React, { useState } from "react";
import { MenuIcon, XIcon } from "@shopify/polaris-icons";
import { Icon } from "@shopify/polaris";

export default function Sidebar({ selectedSidebar, setSelectedSidebar }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 1, title: "SEO Insights" },
    { id: 2, title: "Home Page" },
    { id: 3, title: "Product Page" },
    { id: 4, title: "Bulk Product Page" },
    { id: 5, title: "Collection Page" },
    { id: 6, title: "Bulk Collection Page" },
    { id: 7, title: "Company Settings" },
    { id: 8, title: "Blog Page" },
    { id: 9, title: "Image Alt Optimizer" },
    { id: 10, title: "404 Error" },
    { id: 11, title: "HTML Sitemap" },
  ];

  return (
    <div className="app__sidebar">
      <button className="sidebar__toggle_button" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <div className="sidebar__toggle_icon">{isSidebarOpen ? <XIcon /> : <MenuIcon />}</div>
      </button>

      <div className={`sidebar__menu ${isSidebarOpen ? "active" : ""}`}>
        {menuItems?.map((data) => (
          <div
            key={data?.id}
            className={`sidebar__menu_item ${data?.id === selectedSidebar ? "sidebar__selected_item" : ""}`}
            onClick={() => {
              setSelectedSidebar(data?.id);
              setSidebarOpen(false);
            }}
          >
            {data?.title}
          </div>
        ))}
      </div>
    </div>
  );
}
