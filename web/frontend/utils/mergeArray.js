export const mergeArrays = async (arr1, arr2) => {
  const merged = [...arr1];

  arr2.forEach((item2) => {
    const index = merged.findIndex((item1) => item1.id === item2.productId);

    if (index !== -1) {
      // Merge existing object properties
      merged[index] = {
        ...merged[index],
        seo: {
          title: item2.metaTitle,
          description: item2.metaDescription,
        },
      };
    } else {
      // Add new object if `id` not found
      merged.push(item2);
    }
  });

  return merged;
};
