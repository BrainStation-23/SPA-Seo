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

export const seofyJsonldSnippet = `
    {% if render_type == "product" %}
        <script type="application/ld+json">
        {% if product.variants.size > 0 %}
            {
            "@context": "https://schema.org",
            "@type": "ProductGroup",
            "@id": "{{ shop.url }}/products/{{ product.handle }}",
            "name": "{{ product.title | escape }}",
            "description": {{ product.description | strip_html | json }},
            "url": "{{ shop.url }}/products/{{ product.handle }}",
            "mainEntityOfPage": "{{ shop.url }}/products/{{ product.handle }}",
            "sameAs": "{{ shop.url }}/products/{{ product.handle }}",
            "image": [
                {% for image in product.images %}"https:{{ image.src | image_url }}"{% if forloop.last == false %},{% endif %}
                {% endfor %}],
            "brand": {
                "@type": "Brand",
                {% if product.vendor %}"name": "{{ product.vendor | escape }}"{% else %}"name": "{{ org_data.brand.name | escape }}"{% endif %}
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": {{ data.rating }},
                "reviewCount": {{ data.reviewCount }},
                "itemReviewed": {
                "@type": "Product",
                "@id": "{{ shop.url }}/products/{{ product.handle }}"
                }
            },
            {% if data.showtags %}"keywords": "{{ product.tags | join: ', ' }}",{% endif %}
            "hasVariant": [
                {% if data.showVarinats %}
                {% for variant in product.variants %}
                {
                    "@type": "Product",
                    "name": "{{ product.title | append: " (" | append: variant.title | append: ")" | escape }}",
                    "image": "{% if variant.image %}https:{{ variant.image.src | image_url }}{% else %}https:{{ product.featured_image.src | image_url }}{%endif%}",
                    "sku": {{ variant.sku | json | remove: "\n" | remove: "\r" }},
                    "mpn": "{{ variant.barcode | escape }}",
                    "url": "{{ shop.url }}/products/{{ product.handle }}?variant={{ variant.id }}",
                    "offers": {
                    "@type": "Offer",
                    "priceCurrency": "{{ shop.currency | escape }}",
                    "price": {{ variant.price | money_without_currency | remove: ',' }},
                    "availability": "{% if variant.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
                    "seller": {
                        "@type": "Organization",
                        "name": "{{ shop.name | escape }}",
                        "url": "{{ shop.url | escape }}"
                    }
                    }
                }{% if forloop.last == false %},{% endif %}{% endfor %}
                {% else %}
                {% assign default_variant = product.variants.first  %}
                {
                    "@type": "Product",
                    "name": "{{ product.title | append: " (" | append: default_variant.title | append: ")" | escape }}",
                    "image": "{% if default_variant.image %}https:{{ default_variant.image.src | image_url }}{% else %}https:{{ product.featured_image.src | image_url }}{%endif%}",
                    "sku": {{ default_variant.sku | json | remove: "\n" | remove: "\r" }},
                    "mpn": "{{ default_variant.barcode | escape }}",
                    "url": "{{ shop.url }}/products/{{ product.handle }}?variant={{ default_variant.id }}",
                    "offers": {
                    "@type": "Offer",
                    "priceCurrency": "{{ shop.currency | escape }}",
                    "price": {{ default_variant.price | money_without_currency | remove: ',' }},
                    "availability": "{% if default_variant.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
                    "seller": {
                        "@type": "Organization",
                        "name": "{{ shop.name | escape }}",
                        "url": "{{ shop.url | escape }}"
                    }
                    }
                }
                {% endif %}
            ]
            }
        {% else %}
            {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": "{{ shop.url }}/products/{{ product.handle }}",
            "name": "{{ product.title | escape }}",
            "description": {{ product.description | strip_html | json }},
            "url": "{{ shop.url }}/products/{{ product.handle }}",
            "mainEntityOfPage": "{{ shop.url }}/products/{{ product.handle }}",
            "sameAs": "{{ shop.url }}/products/{{ product.handle }}",
            "image": [
                {% for image in product.images %}"https:{{ image.src | image_url }}"{% if forloop.last == false %},{% endif %}
                {% endfor %}
            ],
            "sku": {{ product.variants.first.sku | json | remove: "\\n" | remove: "\\r" }},
            "mpn": "{{ product.variants.first.barcode | escape }}",
            "brand": {
                "@type": "Brand",
                {% if product.vendor %}"name": "{{ product.vendor | escape }}"{% else %}"name": "{{ org_data.brand.name | escape }}"{% endif %}
            },
            {% if data.showtags %}"keywords": "{{ product.tags | join: ', ' }}",{% endif %}
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": {{ data.rating }},
                "reviewCount": {{ data.reviewCount }},
                "itemReviewed": {
                "@type": "Product",
                "@id": "{{ shop.url }}/products/{{ product.handle }}"
                }
            },
            "offers": [
            {% for variant in product.variants %}{
                "@type": "Offer",
                "priceCurrency": "{{ shop.currency | escape }}",
                "price": {{ variant.price | money_without_currency | remove: ',' }},
                "availability": "{% if variant.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
                "sku": {{ variant.sku | json | remove: "\\n" | remove: "\\r" }},
                "mpn": "{{ variant.barcode | escape }}",
                "url": "{{ shop.url }}/products/{{ product.handle }}?variant={{ variant.id }}",
                "seller": {
                    "@type": "Organization",
                    "name": "{{ shop.name | escape }}",
                    "url": "{{ shop.url | escape }}"
                }
                }{% if forloop.last == false %},{% endif %}{% endfor %}
            ]
            }{% endif %}
        </script>
    {% elsif render_type = "article" %}
        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@id": "{{ article.url }}",
                "@type": "Article",
                "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "{{shop.secure_url}}{{ article.url }}"
                },
                {% if data.showTags %}"keywords": "{{ article.tags | join: ', ' }}",{% endif %}
                "articleBody": {{ article.content | strip_html | strip_newlines | json }},
                "headline": "{{ article.title | strip_html | strip_newlines | escape }}",
                "description": "{{ article.excerpt | strip_html | strip_newlines | escape }}",
                "image": "https:{{ article.image.src | image_url }}",
                "datePublished": "{{ article.published_at }}",
                "dateModified": "{{ article.updated_at }}",
                "audience": {
                "@type": "Audience",
                "audienceType": "{{ data.audienceType }}"
                },
                "author": [
                {
                    "@type": "Person",
                    {% if data.authorUrl %}"url": "{{ data.authorUrl }}",{% endif %}
                    "name": "{{ article.author }}"
                }{% if data.additionalAuthors.size > 0 %},{% endif %}
                {% for author in data.additionalAuthors %}
                    {
                    "@type": "Person",
                    {% if author.url %}"url": "{{ author.url }}",{% endif %}
                    "name": "{{ author.name }}"
                    }{% if forloop.last == false %},{% endif %}
                {% endfor %}
                ],
                {% if data.showComments and article.comments.size > 0 %}
                "comment": [
                {% for cmnt in article.comments %}
                {
                    "@type": "Comment",
                    "text": "{{ cmnt.content | strip_html | strip_newlines | escape }}",
                    "dateCreated": "{{ cmnt.created_at }}",
                    "author": {
                    "@type": "Person",
                    "name": "{{ cmnt.author }}",
                    "email": "{{ cmnt.email }}"
                    }
                }{% if forloop.last == false %},{% endif %}
                {% endfor %}
                ],
                "commentCount": {{ article.comments_count }},
                {% endif %}
                "publisher": {
                "@type": "Organization",
                "name": "{{ shop.name }}",
                "url": "{{ shop.url }}"
                }
            }
        </script>
    {% elsif render_type == "collection" %}
        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "ProductCollection",
                "name": "{{ collection.title | escape }}",
                "description": {{ collection.description | strip_html | strip_newlines | json }},
                "keywords": "{{ data.keywords | escape }}",
                "provider": {
                "@type": "Organization",
                "name": "{{ shop.name | escape }}",
                "url": "{{ shop.url | escape }}"
                }{% if collection.products.size > 0 %},{% endif %}
                {% if collection.products.size > 0 %}"hasItem": [
                {% for product in collection.products %}
                {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": "{{ product.title | strip_html | strip_newlines | escape }}",
                    "description": {{ product.description | strip_html | strip_newlines | json }},
                    "image": [
                    {% for image in product.images %}"https:{{ image.src | image_url }}"{% if forloop.last == false %},{% endif %}
                    {% endfor %}
                    ],
                    "sku": {{ product.variants.first.sku | json | remove: "\n" | remove: "\r" }},
                    "mpn": "{{ product.variants.first.barcode | escape }}",
                    "brand": {
                    "@type": "Brand",
                    {% if product.vendor %}"name": "{{ product.vendor | escape }}"{% else %}"name": "{{ org_data.brand.name | escape }}"{% endif %}
                    },
                    {% if product.metafields['bs-23-seo-app']['json-ld'].value != null %}"aggregateRating": {
                    {% assign product_metadata = product.metafields['bs-23-seo-app']['json-ld'].value %}
                    "@type": "AggregateRating",
                    "itemReviewed": {
                        "@type": "Thing",
                        "name": "{{ product.title | strip_html | strip_newlines | escape }}"
                    },
                    "ratingValue": {{ product_metadata.product.rating }},
                    "reviewCount": {{ product_metadata.product.reviewCount }}
                    },{% endif %}
                    "offers": [
                    {% assign first_variant = product.variants.first %}{
                        "@type": "Offer",
                        "priceCurrency": "{{ shop.currency | escape }}",
                        "price": {{ first_variant.price | money_without_currency | remove: ',' }},
                        "availability": "{% if first_variant.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
                        "mpn": "{{ first_variant.barcode | escape }}",
                        "url": "{{ shop.url }}/products/{{ product.handle }}?variant={{ first_variant.id }}",
                        "seller": {
                        "@type": "Organization",
                        "name": "{{ shop.name | escape }}",
                        "url": "{{ shop.url | escape }}"
                        }
                    }
                    ]
                }{% if forloop.last == false %},{% endif %}{% endfor %}
                ]{% endif %}
            }
        </script>
    {% elsif render_type == "company" %}
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "{{ data.businessType }}",
        "name": "{{ shop.name | escape }}",
        "description": "{{ shop.description | escape }}",
        "url": "{{ shop.url }}",
        "brand": "{{ data.brand.name }}",
        {% if data.businessType == "LocalBusiness" %}"image": "{{ data.brand.logo }}",{% endif %}
        "logo": {% if data.logo %} "{{ data.logo }}" {% else %} "{{ shop.logo | default: shop.url }}" {% endif %},
        "keywords": "{{ data.industry | escape }}",
        {% if data.businessType == "LocalBusiness" %}"priceRange": "{{ data.priceRange[0] }} - {{ data.priceRange[1] }}",{% endif %}
        "sameAs": [
          "{% if data.socialLinks.facebook %}{{ data.socialLinks.facebook | escape }}{% endif %}",
          "{% if data.socialLinks.twitter %}{{ data.socialLinks.twitter | escape }}{% endif %}",
          "{% if data.socialLinks.instagram %}{{ data.socialLinks.instagram | escape }}{% endif %}",
          "{% if data.socialLinks.youtube %}{{ data.socialLinks.youtube | escape }}{% endif %}",
          "{% if data.socialLinks.pinterest %}{{ data.socialLinks.pinterest | escape }}{% endif %}",
          "{% if data.socialLinks.linkedin %}{{ data.socialLinks.linkedin | escape }}{% endif %}",
          "{% if data.socialLinks.snapchat %}{{ data.socialLinks.snapchat | escape }}{% endif %}",
          "{% if data.socialLinks.tiktok %}{{ data.socialLinks.tiktok | escape }}{% endif %}"
        ],
        {% if data.showContact %}
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "{{ shop.phone | escape }}",
            "contactType": "Customer Service"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "{{ shop.address.address1 | escape }}{% if shop.address.address2 %}, {{ shop.address.address2 | escape }}{% endif %}",
            "addressLocality": "{{ shop.address.city | escape }}",
            "addressRegion": "{{ shop.address.province | escape }}",
            "postalCode": "{{ shop.address.zip | escape }}",
            "addressCountry": "{{ shop.address.country_code | escape }}"
          }
        {% endif %}
      }
    </script>
    {% endif %}
    `;
