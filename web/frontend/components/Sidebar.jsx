import React from "react";

export default function Sidebar({ selectedSidebar, setSelectedSidebar }) {
  const menuItems = [
    { id: 1, title: "SEO Insights" },
    { id: 2, title: "Home page" },
    { id: 3, title: "Product page" },
    { id: 4, title: "Bulk Product page" },
    { id: 5, title: "Collection page" },
    { id: 6, title: "Bulk Collection page" },
    { id: 7, title: "Company Settings" },
    { id: 8, title: "Blog page" },
    { id: 9, title: "Image alt optimizer" },
    { id: 10, title: "Product Image filename" },
    { id: 11, title: "404 Error" },
  ];

  return (
    <div className="app__sidebar_container">
      {menuItems?.map((data) => (
        <div
          key={data?.id}
          className={`sidebar__menu_item ${
            data?.id === selectedSidebar ? "sidebar__selected_item" : ""
          }`}
          onClick={() => setSelectedSidebar(data?.id)}
        >
          {data?.title}
        </div>
      ))}
    </div>
  );
}
