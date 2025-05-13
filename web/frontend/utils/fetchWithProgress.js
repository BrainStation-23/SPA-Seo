export const fetchWithProgess = async (
  taskQueue,
  setProgress,
  setCompleatedTask,
  updateSiteSpeedUpState
) => {
  try {
    let compleated = 0;
    const totalTaskCount = Object.entries(taskQueue).length;
    for (const [key, val] of Object.entries(taskQueue)) {
      // call api
      if (key === "instantPage") {
        const mutate = val.mutate;
        mutate({ activate: val.flag });
      } else if (key === "lazyLoading") {
      } else if (key === "streamlinedLoadin1g") {
      } else if (key === "optimizedLoading") {
      } else if (key === "assetFileOptimization") {
      } else if (key === "streamlineCode") {
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

    updateSiteSpeedUpState((prev) => {
      return {
        ...prev,
        ...taskQueue,
      };
    });
  } catch (error) {
    console.log(error);
  }
};
