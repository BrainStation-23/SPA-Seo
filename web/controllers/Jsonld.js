import shopify from "../shopify.js";
export const testApi = async (req, res, next) => {
  try {
    console.log("🚀 ~ file: innnnnnnnnn");
    await createProductSnippet(res.locals.shopify.session);
    await createArticleSnippet(res.locals.shopify.session);
    return res.status(200).json({ message: "GG" });
  } catch (error) {
    console.error(error);
  }
};

async function createProductSnippet(session) {
  try {
    console.log("🚀 ~ file: ok gg inside function");
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

    const themeList = await shopify.api.rest.Theme.all({
      session,
      fields: "id,name,role",
    });

    console.log("🚀 ~ file: after getting all theme");

    const mainTheme = themeList?.data?.find(
      (theme) => theme?.role === "development"
    );

    console.log("🚀 ~ file: after finding theme");

    const isPresent = await isProductSnippetsAvailable(session, mainTheme?.id);

    console.log("🚀 ~ file: after is product snippet available call");

    //Create snippets if not found
    if (!isPresent) {
      console.log("🚀 ~ file: could not find snippet");
      const asset = new shopify.api.rest.Asset({
        session,
      });
      asset.theme_id = mainTheme?.id;
      asset.key = "snippets/seofy-product-snippet.liquid";
      asset.value = updatedProductSnippet;
      await asset.save({
        update: true,
      });
    }

    const assetFile = await shopify.api.rest.Asset.all({
      session,
      theme_id: mainTheme?.id,
      asset: { key: "sections/main-product.liquid" },
    });

    const assetFileContent = assetFile?.data?.[0]?.value;
    const productSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*product\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    console.log("🚀 ~ file: before check");

    if (
      !assetFileContent.includes(
        "{% render 'seofy-product-snippet', data: data.product, org_data: shop_data.organization %}"
      )
    ) {
      console.log("🚀 ~ file: pay nai");
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

      console.log("🚀 ~ file: updated content", updatedContent);

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = mainTheme?.id;
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

async function isProductSnippetsAvailable(session, id) {
  try {
    await shopify.api.rest.Asset.all({
      session: session,
      theme_id: id,
      asset: { key: "snippets/seofy-product-snippet.liquid" },
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function createArticleSnippet(session) {
  try {
    console.log("🚀 ~ file: ok gg inside function");
    const updatedArticleSnippet = `
<script id="blog-snippet" type="application/ld+json">
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

    const themeList = await shopify.api.rest.Theme.all({
      session,
      fields: "id,name,role",
    });

    console.log("🚀 ~ file: after getting all theme");

    const mainTheme = themeList?.data?.find(
      (theme) => theme?.role === "development"
    );

    console.log("🚀 ~ file: after finding theme");

    const isPresent = await isArticleSnippetsAvailable(session, mainTheme?.id);

    console.log("🚀 ~ file: after is article snippet available call");

    //Create snippets if not found
    if (!isPresent) {
      console.log("🚀 ~ file: could not find snippet");
      const asset = new shopify.api.rest.Asset({
        session,
      });
      asset.theme_id = mainTheme?.id;
      asset.key = "snippets/seofy-article-snippet.liquid";
      asset.value = updatedArticleSnippet;
      await asset.save({
        update: true,
      });
    }

    const assetFile = await shopify.api.rest.Asset.all({
      session,
      theme_id: mainTheme?.id,
      asset: { key: "sections/main-article.liquid" },
    });

    const assetFileContent = assetFile?.data?.[0]?.value;
    const articleSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*article\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    console.log("🚀 ~ file: before check");

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

      console.log("🚀 ~ file: updated content", updatedContent);

      const layout = new shopify.api.rest.Asset({
        session,
      });
      layout.theme_id = mainTheme?.id;
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

async function isArticleSnippetsAvailable(session, id) {
  try {
    await shopify.api.rest.Asset.all({
      session: session,
      theme_id: id,
      asset: { key: "snippets/seofy-article-snippet.liquid" },
    });
    return true;
  } catch (error) {
    return false;
  }
}
