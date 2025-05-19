import Joi from "joi";

export const speedInsightsValidationSchema = Joi.object({
  isInstantPage: Joi.boolean().default(true),
  isLazyLoading: Joi.boolean().default(false),
  isStreamLineLoading: Joi.boolean().default(false),
  isOptimizedLoading: Joi.boolean().default(false),
  isAssetFileOptimization: Joi.boolean().default(false),
  isStreamlineCode: Joi.boolean().default(false),
});
