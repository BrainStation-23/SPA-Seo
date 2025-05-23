export const fetchWithProgess = async (
  taskQueue,
  fetcher,
  setProgress,
  setCompleatedTask
) => {
  try {
    let compleated = 0;
    const totalTaskCount = Object.entries(taskQueue).length;
    for (const [key, val] of Object.entries(taskQueue)) {
      // call api
      if (key === "isInstantPage") {
        await fetcher("/api/seo/instant-pages", {
          method: "POST",
          body: JSON.stringify({ activate: val }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (key === "isLazyLoading") {
        await fetcher("/api/seo/lazy-loading", {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (key === "isStreamLineLoading") {
      } else if (key === "isOptimizedLoading") {
      } else if (key === "isAssetFileOptimization") {
        await fetcher("/api/seo/optimize-css", {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (key === "isStreamlineCode") {
      } else {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, 1000)
        );
      }

      // update progress logic
      compleated++;
      setCompleatedTask(compleated);
      setProgress((compleated / totalTaskCount) * 100);
    }
  } catch (error) {
    console.log(error);
  }
};
