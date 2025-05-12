import mongoose from "mongoose";

const SpeedInsightsSchema = new mongoose.Schema({
  platformStoreURL: {
    type: String, // If you're connecting to a users collection
    required: true,
  },
  isInstantPage: {
    type: Boolean,
    default: true,
  },
  isLazyLoading: {
    type: Boolean,
    default: false,
  },
  isStreamLineLoading: {
    type: Boolean,
    default: false,
  },
  isOptimizedLoading: {
    type: Boolean,
    default: false,
  },
  isAssetFileOptimization: {
    type: Boolean,
    default: false,
  },
  isStreamlineCode: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SpeedInsights = mongoose.model("SpeedInsights", SpeedInsightsSchema);
export default SpeedInsights;
