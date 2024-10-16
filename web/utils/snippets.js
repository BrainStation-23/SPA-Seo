export const seofySitemap = `{% assign seofy_sitemap = shop.metafields.seo-app-bs23.seo-htmlsitemap-article.value %}
{% assign sitemap_limit_show = seofy_sitemap.limit %}
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
  </style>
<div class="page-width">
   <h1 class="seofy-page-title">HTML sitemap</h1>
  {% assign sitemap_options = seofy_sitemap.category %}
  <div class="seofy-sitemap-container">
    <div class="seofy-sitemap-options">
        {%- for option in sitemap_options -%}
          <div class="seofy-sitemap-item">{{ option }}</div>
        {%- endfor -%}
    </div>
  </div>

</div>
{% endif %}`;

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
