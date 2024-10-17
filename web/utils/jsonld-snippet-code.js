export const code = `
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
