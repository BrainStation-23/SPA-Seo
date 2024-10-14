import shopify from "../shopify.js";
export const testApi = async (req, res, next) => {
  try {
    console.log("🚀 ~ file: innnnnnnnnn");
    await createProductSnippet(res.locals.shopify.session);
    return res.status(200).json({ message: "GG" });
  } catch (error) {
    console.error(error);
  }
};

async function createProductSnippet(session) {
  try {
    console.log("🚀 ~ file: ok gg inside function");
    const updatedProductSnippet = `
{% assign data = product.metafields['bs-23-seo-app']['json-ld'].value.product %}
{% assign org_data = shop.metafields['bs-23-seo-app']['json-ld'].value.organization %}
<script type="application/ld+json">
  {% if product.variants.size > 1 %}
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
      "sku": {{ product.variants.first.sku | json | remove: "\n" | remove: "\r" }},
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
          "sku": {{ variant.sku | json | remove: "\n" | remove: "\r" }},
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
    } else {
      return;
    }

    const assetFile = await shopify.api.rest.Asset.all({
      session,
      theme_id: mainTheme?.id,
      asset: { key: "sections/main-product.liquid" },
    });

    console.log(assetFile);

    const assetFileContent = assetFile?.data?.[0]?.value;
    const productSnippetRegExp =
      /<script\s+type="application\/ld\+json">\s*{{\s*product\s*\|\s*structured_data\s*}}\s*<\/script>/g;

    console.log("🚀 ~ file: before check");

    if (!assetFileContent.includes("{% render 'seofy-product-snippet' %}")) {
      console.log("🚀 ~ file: pay nai");
      let updatedContent = assetFileContent;
      if (assetFileContent.test(productSnippetRegExp)) {
        updatedContent = assetFileContent.replace(
          productSnippetRegExp,
          `
          {% render 'seofy-product-snippet' %}`
        );
      } else {
        updatedContent += `
        {% render 'seofy-product-snippet' %}`;
      }

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

    console.log(200, "success");

    // return res.status(200).json({
    //   status: "success",
    //   message: "successfully updated",
    // });
  } catch (err) {
    console.log(err);
    // res.status(400).json({ err });
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
