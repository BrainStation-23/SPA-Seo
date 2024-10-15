export const seofySitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign seofy_sitemap = shop.metafields.seo-app-bs23.seo-htmlsitemap-article %}
{% if seofy_sitemap.isActiveSitemap == true %}
  {% assign sitemap_options = seofy_sitemap.category %}
  {% assign sitemap_blogs = seofy_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = seofy_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
{% endif %}
</div>`;

export const productSitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign ak_autoketing_sitemap = shop.metafields.autoketing_seo.ak_autoketing_sitemap %}
{% if ak_autoketing_sitemap.sitemap_status == true %}
  {% assign sitemap_limit_show = ak_autoketing_sitemap.sitemap_limit_show %}
  {% assign sitemap_options = ak_autoketing_sitemap.sitemap_options %}
  {% assign sitemap_blogs = ak_autoketing_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = ak_autoketing_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
  <br>
  <div class="row">
    {% if sitemap_options contains "Products" %}
      <div class="col-md-6">
        <h2>Products</h2>
        <ul>
          {%- paginate collections.all.products by sitemap_limit_show -%}
            {%- for product in collections.all.products -%}
              <li>{{ product.title | link_to: product.url }}</li>
            {%- endfor -%}
            {{ paginate | default_pagination: next: '>', previous: '<' }}
          {%- endpaginate -%}
        </ul>
      </div>
    {% endif %}
  </div>
{% endif %}
</div>`;

export const pageSitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign ak_autoketing_sitemap = shop.metafields.autoketing_seo.ak_autoketing_sitemap %}
{% if ak_autoketing_sitemap.sitemap_status == true %}
  {% assign sitemap_limit_show = ak_autoketing_sitemap.sitemap_limit_show %}
  {% assign sitemap_options = ak_autoketing_sitemap.sitemap_options %}
  {% assign sitemap_blogs = ak_autoketing_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = ak_autoketing_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
  <br>
  <div class="row">
    {% if sitemap_options contains "Pages" %}
      <div class="col-md-6">
        <h2>Pages</h2>
        <ul>
          {%- paginate pages by sitemap_limit_show -%}
            {%- for page in pages -%}
              <li>{{ page.title | link_to: page.url }}</li>
            {%- endfor -%}
            {{ paginate | default_pagination: next: '>', previous: '<' }}
          {%- endpaginate -%}
        </ul>
      </div>
    {% endif %}
  </div>
{% endif %}
</div>`;

export const collectionsSitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign ak_autoketing_sitemap = shop.metafields.autoketing_seo.ak_autoketing_sitemap %}
{% if ak_autoketing_sitemap.sitemap_status == true %}
  {% assign sitemap_limit_show = ak_autoketing_sitemap.sitemap_limit_show %}
  {% assign sitemap_options = ak_autoketing_sitemap.sitemap_options %}
  {% assign sitemap_blogs = ak_autoketing_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = ak_autoketing_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
  <br>
  <div class="row">
    {% if sitemap_options contains "Collections" %}
      <div class="col-md-6">
        <h2>Collections</h2>
        <ul>
          {% comment %}<li>{{ 'All Products' | link_to: '/collections/all' }}</li>{% endcomment %}
          {%- paginate collections by sitemap_limit_show -%}
            {%- for collection in collections -%}
              <li>{{ collection.title | link_to: collection.url }}</li>
            {%- endfor -%}
            {{ paginate | default_pagination: next: '>', previous: '<' }}
          {%- endpaginate -%}
        </ul>
      </div>
    {% endif %}
  </div>
{% endif %}
</div>`;

export const blogSitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign ak_autoketing_sitemap = shop.metafields.autoketing_seo.ak_autoketing_sitemap %}
{% if ak_autoketing_sitemap.sitemap_status == true %}
  {% assign sitemap_limit_show = ak_autoketing_sitemap.sitemap_limit_show %}
  {% assign sitemap_options = ak_autoketing_sitemap.sitemap_options %}
  {% assign sitemap_blogs = ak_autoketing_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = ak_autoketing_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
  <br>
  <div class="row">
    {% if sitemap_options contains "Blogs" %}
      <div class="col-md-6">
        <h2>Blogs</h2>
        <ul>
          {% for tag_blog in sitemap_blogs %}
            <li>{{ blogs[tag_blog].title | link_to: blogs[tag_blog].url }}</li>
          {% endfor %}
        </ul>
      </div>
    {% endif %}
  </div>
{% endif %}
</div>
`;

export const articleSitemap = `<div class="page-width page-width--narrow">
<h1 class="page-title">HTML sitemap</h1>
{% assign ak_autoketing_sitemap = shop.metafields.autoketing_seo.ak_autoketing_sitemap %}
{% if ak_autoketing_sitemap.sitemap_status == true %}
  {% assign sitemap_limit_show = ak_autoketing_sitemap.sitemap_limit_show %}
  {% assign sitemap_options = ak_autoketing_sitemap.sitemap_options %}
  {% assign sitemap_blogs = ak_autoketing_sitemap.sitemap_blogs %}
  {% assign sitemap_additional_link = ak_autoketing_sitemap.sitemap_additional_link %}
  {% assign sitemap_additional_link_size = sitemap_additional_link | size %}
  <div class="row">
    <div class="col-md-6">
      <ul>
        <li>{{ pages["autoketing-sitemap"].title | link_to: pages["autoketing-sitemap"].url }}</li>
        {%- for option in sitemap_options -%}
          {% if option == "Collections" %}
            <li>{{ pages["autoketing-sitemap-collections"].title | link_to: pages["autoketing-sitemap-collections"].url }}</li>
          {% endif %}
          {% if option == "Products" %}
            <li>{{ pages["autoketing-sitemap-products"].title | link_to: pages["autoketing-sitemap-products"].url }}</li>
          {% endif %}
          {% if option == "Blog Posts" %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=0" %}
            <li>{{ pages["autoketing-sitemap-articles"].title | link_to: blog_posts_url }}</li>
          {% endif %}
          {% if option == "Blogs" %}
            <li>{{ pages["autoketing-sitemap-blogs"].title | link_to: pages["autoketing-sitemap-blogs"].url }}</li>
          {% endif %}
          {% if option == "Pages" %}
            <li>{{ pages["autoketing-sitemap-pages"].title | link_to: pages["autoketing-sitemap-pages"].url }}</li>
          {% endif %}
        {%- endfor -%}
        {% if sitemap_additional_link_size > 0 %}
          <li>{{ pages["autoketing-sitemap-additional-links"].title | link_to: pages["autoketing-sitemap-additional-links"].url }}</li>
        {% endif %}
      </ul>
    </div>
  </div>
  <br>
  <div class="row">
    {% if sitemap_options contains "Blog Posts" %}
      {% assign param_blog = 0 %}
      {% assign page_url = content_for_header | split: '"pageurl":"' | last | split: '"' | first | split: '.myshopify.com' | last | replace: '\/', '/' | replace: '%20', ' ' | replace: '\u0026', '&' %}
      {% for i in (1..1) %}
        {% unless page_url contains "?" %}{% break %}{% endunless %}
        {% assign query_string = page_url | split: '?' | last %}
        {% assign qry_parts = query_string | split: '&' %}
        {% for part in qry_parts %}
          {% assign key_and_value = part | split: '=' %}
          {% if key_and_value.size > 1 %}
            {% if key_and_value[0] == 'blog' %}
              {% assign param_blog = key_and_value[1] | abs %}
            {% endif %}
          {% endif %}
        {% endfor %}
      {% endfor %}
      {% assign blog_handle = sitemap_blogs[param_blog] %}
      {% assign blog_handle_size = blog_handle | size %}
      {% if blog_handle_size == 0 %}
        {% assign blog_handle = "news" %}
      {% endif %}
      <div class="col-md-6">
        <h2>{{ blogs[blog_handle].title }}</h2>
        <ul>
          {%- paginate blogs[blog_handle].articles by sitemap_limit_show -%}
            {%- for article in blogs[blog_handle].articles -%}
              <li>
                {{ article.title | link_to: article.url }}
              </li>
            {%- endfor -%}
            {{ paginate | default_pagination: next: '>', previous: '<' }}
          {%- endpaginate -%}
        </ul>
        <h2>Blogs</h2>
        <ul>
          {% for tag_blog in sitemap_blogs %}
            {% assign blog_posts_url = pages["autoketing-sitemap-articles"].url | append: "?page=1&blog=" | append: forloop.index0 %}
            <li>{{ blogs[tag_blog].title | link_to: blog_posts_url }}</li>
          {% endfor %}
        </ul>
      </div>
    {% endif %}
  </div>
{% endif %}
</div>
`;

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
