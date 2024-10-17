export const seofySitemap = `{% assign seofy_sitemap = shop.metafields.seo-app-bs23.seo-htmlsitemap-article.value %}
{% assign seofy_limit = seofy_sitemap.limit %}
{% assign seofy_blog_handle = seofy_sitemap.seofy_blogs %}
{% if seofy_sitemap.isActiveSitemap == true %}
  <style>
    .seofy-page-title{
      text-align: center;  
      margin: 12px 0;
    }
    
    .seofy-sitemap-container{
      width: 100%;
    }

    .seofy-sitemap-options{
      display: flex;
      gap: 16px;
    }

    .seofy-sitemap-item{
      padding: 8px 20px;
      border: 1px solid rgba(221, 224, 228, 1);
      border-radius: 8px;
      cursor: pointer;
    }

    .seofy-sitemap-item.active {
    background-color: #e0f7fa;
    font-weight: bold;
  }

    .seofy-category-container{
      margin: 24px 0;
    }

    .seofy-category-title{
      margin-bottom: 8px;
    }

    .seofy-category-item-list{
      display: grid;
      grid-template-columns: repeat(4, minmax(200px, 1fr)); /* Dynamic grid with min-width */
      gap: 16px;
      width: 100%;
    }

    .seofy-category-item{
      padding: 8px 20px;
      border: 1px solid rgba(221, 224, 228, 1);
      border-radius: 8px;
      cursor: pointer;
    }

    .seofy-products-pagination{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin: 10px 0;
    }

    .seofy-products-pagination .page,
     .seofy-products-pagination .next,
    .seofy-products-pagination .prev {
      padding: 4px 12px;
      border: 1px solid rgba(221, 224, 228, 1);
      border-radius: 8px;
    }

     @media (max-width: 1200px) {
    .seofy-category-item-list {
      grid-template-columns: repeat(3, minmax(200px, 1fr)); /* Maintain 4 columns */
    }

    .seofy-sitemap-options {
      gap: 16px; /* Maintain original gap */
    }

    .seofy-sitemap-item {
      flex: 1 1 calc(25% - 12px); /* 4 items per row with appropriate spacing */
    }
  }

    @media (max-width: 768px) {
    .seofy-category-item-list {
      grid-template-columns: repeat(2, minmax(150px, 1fr)); /* 2 columns for tablets and smaller devices */
    }

     .seofy-sitemap-options {
      gap: 10px; /* Reduce gap for tablets */
      justify-content: space-between; /* Align items more evenly */
      flex-wrap: wrap;
    }

    .seofy-sitemap-item {
      flex: 1 1 45%; /* Allow items to take up about 45% of the container width */
      text-align: center; /* Center text for better appearance */
    }
  }

  @media (max-width: 480px) {
    .seofy-category-item-list {
      grid-template-columns: 1fr; /* 1 column for mobile phones */
    }

    .seofy-sitemap-options {
      flex-direction: row; /* Keep items in a row */
      align-items: stretch; /* Stretch items to full height */
      flex-wrap: wrap;
    }

    .seofy-sitemap-item {
      flex: 1 1 calc(50% - 8px); /* 2 items per row with some spacing */
      margin-bottom: 10px; /* Space between rows */
    }
  }
  </style>
<div class="page-width">
   <h1 class="seofy-page-title">HTML sitemap</h1>
  {% assign sitemap_options = seofy_sitemap.category %}
  <div class="seofy-sitemap-container">
    <div class="seofy-sitemap-options">
         <div class="seofy-sitemap-item active" data-target="all">All</div>
        {%- for option in sitemap_options -%}
          <div class="seofy-sitemap-item" data-target="seofy-{{ option | downcase }}-container">{{ option }}</div>
        {%- endfor -%}
    </div>
  </div>
  {% if sitemap_options contains "Products" %}
   <div class="seofy-category-container" id="seofy-products-container">
          <h2 class="seofy-products-title">Products</h2>  
            {%- paginate collections.all.products by seofy_limit -%}
              <div class="seofy-category-item-list">
              {%- for product in collections.all.products -%}
                <div class="seofy-category-item">{{ product.title | link_to: product.url }}</div>
              {%- endfor -%}
                </div>
             <div class="seofy-products-pagination"> {{ paginate | default_pagination: next: '>', previous: '<' }}</div>
            {%- endpaginate -%}         
    </div>
  {% endif %}
  {% if sitemap_options contains "Collections" %}
        <div class="seofy-category-container" id="seofy-collections-container">
          <h2 class="seofy-category-title">Collections</h2>
              <div class="seofy-category-item-list">
              {%- for collection in collections -%}
                <div class="seofy-category-item">{{ collection.title | link_to: collection.url }}</div>
              {%- endfor -%}
              </div>         
        </div>
  {% endif %}
  {% if sitemap_options contains "Blogs" %}
   <div class="seofy-category-container" id="seofy-blogs-container">
    <h2 class="seofy-category-title">Blogs</h2>
    <div class="seofy-category-item-list">
       {% for blog_handle in seofy_blog_handle %}
          <div class="seofy-category-item">{{ blogs[blog_handle].title | link_to: blogs[blog_handle].url }}</div>
       {% endfor %}
    </div>
   </div>
  {% endif %}
  {% if sitemap_options contains "Articles" %}
        <div class="seofy-category-container" id="seofy-articles-container">
          <h2 class="seofy-category-title">Articles</h2>
              <div class="seofy-category-item-list">
              {% for blog_handle in seofy_blog_handle %}
                {% assign blog = blogs[blog_handle] %}
                {% for article in blog.articles %}
                 <div class="seofy-category-item">{{ article.title | link_to: article.url }}</div>        
                {% endfor %}     
              {%- endfor -%}
              </div>         
        </div>
  {% endif %}
  {% if sitemap_options contains "Pages" %}
        <div class="seofy-category-container" id="seofy-pages-container">
          <h2 class="seofy-category-title">Pages</h2>
          <div class="seofy-category-item-list">
              {%- for page in pages -%}
                <div class="seofy-category-item">{{ page.title | link_to: page.url }}</div>
              {%- endfor -%}
          </div>
        </div>
      {% endif %}
</div>
{% endif %}


<script>
  document.addEventListener("DOMContentLoaded", function () {
    // Get all option items
    const items = document.querySelectorAll(".seofy-sitemap-item");

    items.forEach(item => {
      item.addEventListener("click", function () {
        const sections = document.querySelectorAll(".seofy-category-container");
        sections.forEach(section => section.style.display = "none");
        
        // Remove active class from all items
        items.forEach(i => i.classList.remove("active"));
        
        // Add active class to the clicked item
        this.classList.add("active");

        if (this.getAttribute("data-target") === "all") {
          // If "All" is clicked, show all sections
          sections.forEach(section => section.style.display = "block");
          this.classList.add("active"); // Add active class to the "All" button
        } else {
        // Hide all sections
        sections.forEach(section => section.style.display = "none");

        // Show the clicked section
        const target = document.getElementById(this.getAttribute("data-target"));
        if (target) {
          target.style.display = "block";
        }
        }
      });
    });
  });
</script>`;

export const updatedTitleMeta = `
    {% if request.page_type == 'index' %}
  {% if shop.metafields['seo-app-bs23']['home-seo-value'] %}
    <title>{{ shop.metafields['seo-app-bs23']['home-seo-value'].value.seo_title | escape }}</title>
    <meta name="description" content="{{ shop.metafields['seo-app-bs23']['home-seo-value'].value.seo_description | escape }}">
  {% else %}
    <title>{{ shop.name | escape }}</title>
    <meta name="description" content="{{ shop.description | escape }}">
  {% endif %}
{% elsif request.page_type == 'article' %}
  {% if article.metafields['seo-app-bs23']['seo-blog-article'] %}
    <title>{{ article.metafields['seo-app-bs23']['seo-blog-article'].value.seoTitle | escape }}</title>
    <meta name="description" content="{{ article.metafields['seo-app-bs23']['seo-blog-article'].value.seoDescription | escape }}">
  {% else %}
    <title>{{ article.title | escape }}</title>
    <meta name="description" content="{{ article.excerpt | escape }}">
  {% endif %}
{% else %}
   <title>
  {{ page_title }}
  {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
  {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
  {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
   </title>
   {% if page_description %}
     <meta name="description" content="{{ page_description | escape }}">
  {% endif %}
{% endif %}

{% if request.page_type == 'index' %}
  {%- assign og_title = shop.metafields['seo-app-bs23']['home-seo-value'].value.seo_title | default: shop.name -%}
  {%- assign og_description = shop.metafields['seo-app-bs23']['home-seo-value']?.value?.seo_description | default: shop.description | default: shop.name -%}
{%- elsif request.page_type == 'article' -%}
  {%- assign og_title = article.metafields['seo-app-bs23']['seo-blog-article'].value.seoTitle | default: article.title -%}
  {%- assign og_description = article.metafields['seo-app-bs23']['seo-blog-article'].value.seoDescription | default: article.excerpt | default: shop.description -%}
{%- else -%}
  {%- assign og_title = page_title | default: shop.name -%}
  {%- assign og_description = page_description | default: shop.description | default: shop.name -%}
{%- endif -%}

{%- liquid
  assign og_url = canonical_url | default: request.origin
  assign og_type = 'website'

  if request.page_type == 'product'
    assign og_type = 'product'
  elsif request.page_type == 'article'
    assign og_type = 'article'
  elsif request.page_type == 'password'
    assign og_url = request.origin
  endif
%}

<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ og_url }}">
<meta property="og:title" content="{{ og_title | escape }}">
<meta property="og:type" content="{{ og_type }}">
<meta property="og:description" content="{{ og_description | escape }}">

{%- if page_image -%}
  <meta property="og:image" content="http:{{ page_image | image_url }}">
  <meta property="og:image:secure_url" content="https:{{ page_image | image_url }}">
  <meta property="og:image:width" content="{{ page_image.width }}">
  <meta property="og:image:height" content="{{ page_image.height }}">
{%- endif -%}

{%- if request.page_type == 'product' -%}
  <meta property="og:price:amount" content="{{ product.price | money_without_currency | strip_html }}">
  <meta property="og:price:currency" content="{{ cart.currency.iso_code }}">
{%- endif -%}

{%- if settings.social_twitter_link != blank -%}
  <meta name="twitter:site" content="{{ settings.social_twitter_link | split: 'twitter.com/' | last | prepend: '@' }}">
{%- endif -%}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ og_title | escape }}">
<meta name="twitter:description" content="{{ og_description | escape }}">
    `;
