import shopify from "../shopify.js";
import { initializeThemeFileContent } from "../utils/initializeThemeContent.js";

export const testApi = async (req, res, next) => {
  try {
    console.log("🚀 ~ file: innnnnnnnnn");
    await createProductSnippet(res.locals.shopify.session);
    await createArticleSnippet(res.locals.shopify.session);
    await createCollectionSnippet(res.locals.shopify.session);
    await createCompanySnippet(res.locals.shopify.session);
    return res.status(200).json({ message: "GG" });
  } catch (error) {
    console.error(error);
  }
};

async function createProductSnippet(session) {
  try {
    const updatedProductSnippet = `
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
`;

    const { assetFileContent, themeId } = await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "sections/main-product.liquid",
      snippetKey: "snippets/seofy-product-snippet.liquid",
      snippetCode: updatedProductSnippet,
    });

    const productSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*product\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    if (
      !assetFileContent.includes(
        "{% render 'seofy-product-snippet', data: data.product, org_data: shop_data.organization %}"
      )
    ) {
      let updatedContent = assetFileContent;
      if (productSnippetRegExp.test(assetFileContent)) {
        const prev_code = assetFileContent.match(productSnippetRegExp)[0];
        updatedContent = updatedContent.replace(
          productSnippetRegExp,
          `
          {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-product-snippet', data: data.product, org_data: shop_data.organization %}
          {% else %}
          ${prev_code}
          {% endif %}  
          `
        );
      } else {
        updatedContent =
          `
          {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-product-snippet', data: data.product, org_data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
      }

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = themeId;
      layout.key = "sections/main-product.liquid";
      layout.value = updatedContent;
      await layout.save({
        update: true,
      });
    }

    console.log(200, "success", "product");
  } catch (err) {
    console.log(err);
  }
}

async function createArticleSnippet(session) {
  try {
    const updatedArticleSnippet = `
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
`;
    const { assetFileContent, themeId } = await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "sections/main-article.liquid",
      snippetKey: "snippets/seofy-article-snippet.liquid",
      snippetCode: updatedArticleSnippet,
    });

    const articleSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*article\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    if (
      !assetFileContent.includes(
        "{% render 'seofy-article-snippet', data: data.article, org_data: shop_data.organization %}"
      )
    ) {
      console.log("🚀 ~ file: pay nai");
      let updatedContent = assetFileContent;
      if (articleSnippetRegExp.test(assetFileContent)) {
        const prev_code = assetFileContent.match(articleSnippetRegExp)[0];
        updatedContent = updatedContent.replace(
          articleSnippetRegExp,
          `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-article-snippet', data: data.article, org_data: shop_data.organization %}
          {% else %}
            ${prev_code}
          {% endif %}  
          `
        );
      } else {
        updatedContent =
          `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-article-snippet', data: data.article, org_data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
      }

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = themeId;
      layout.key = "sections/main-article.liquid";
      layout.value = updatedContent;
      await layout.save({
        update: true,
      });
    }

    console.log(200, "success", "article");
  } catch (err) {
    console.log(err);
  }
}

async function createCollectionSnippet(session) {
  try {
    const updatedCollectionSnippet = `
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
`;

    const { assetFileContent, themeId } = await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "sections/main-collection-product-grid.liquid",
      snippetKey: "snippets/seofy-collection-snippet.liquid",
      snippetCode: updatedCollectionSnippet,
    });

    const collectionSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*collection\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    if (
      !assetFileContent.includes(
        "{% render 'seofy-collection-snippet', data: data.collection, org_data: shop_data.organization %}"
      )
    ) {
      console.log("🚀 ~ file: pay nai");
      let updatedContent = assetFileContent;
      if (collectionSnippetRegExp.test(assetFileContent)) {
        const prev_code = assetFileContent.match(collectionSnippetRegExp)[0];
        updatedContent = updatedContent.replace(
          collectionSnippetRegExp,
          `
          {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-collection-snippet', data: data.collection, org_data: shop_data.organization %}
          {% else %}
            ${prev_code}
          {% endif %}  
          `
        );
      } else {
        updatedContent =
          `
          {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-collection-snippet', data: data.collection, org_data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
      }

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = themeId;
      layout.key = "sections/main-collection-product-grid.liquid";
      layout.value = updatedContent;
      await layout.save({
        update: true,
      });
    }

    console.log(200, "success", "collection");
  } catch (err) {
    console.log(err);
  }
}

async function createCompanySnippet(session) {
  try {
    const updatedCompanySnippet = `
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
`;

    const { assetFileContent, themeId } = await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "sections/header.liquid",
      snippetKey: "snippets/seofy-company-snippet.liquid",
      snippetCode: updatedCompanySnippet,
    });

    const companySnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*[^]*?"@type"\s*:\s*"Organization"[^]*?<\/script>/g;

    if (
      !assetFileContent.includes(
        "{% render 'seofy-company-snippet', data: shop_data.organization %}"
      )
    ) {
      console.log("🚀 ~ file: pay nai");
      let updatedContent = assetFileContent;
      if (companySnippetRegExp.test(assetFileContent)) {
        const prev_code = assetFileContent.match(companySnippetRegExp)[0];
        updatedContent = updatedContent.replace(
          companySnippetRegExp,
          `
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if shop_data != null and shop_data.organization.status %}
            {% render 'seofy-company-snippet', data: shop_data.organization %}
          {% else %}
            ${prev_code}
          {% endif %}  
          `
        );
      } else {
        updatedContent =
          `
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if shop_data != null and shop_data.organization.status %}
            {% render 'seofy-company-snippet', data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
      }

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = themeId;
      layout.key = "sections/header.liquid";
      layout.value = updatedContent;
      await layout.save({
        update: true,
      });
    }

    console.log(200, "success", "company");
  } catch (err) {
    console.log(err);
  }
}
