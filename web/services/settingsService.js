import HtmlCleanerSettings from "../models/htmlCleanerSettingsModel.js"; //

/**
 * Retrieves HTML cleaner settings for a given shop.
 * If no settings exist, it initializes and returns default settings based on the schema.
 * @param {string} shopId - The ID of the shop (e.g., 'your-shop-name.myshopify.com').
 * @returns {Promise<object>} - The settings object, excluding MongoDB-specific fields.
 */
const getSettings = async (shopId) => {
  if (!shopId) {
    throw new Error("shopId is required to get HTML cleaner settings.");
  }
  try {
    let settings = await HtmlCleanerSettings.findOne({ shopId }).lean(); // .lean() returns a plain JS object

    if (!settings) {
      // If no settings found, create a new settings object in memory using schema defaults.
      // This object is not saved to the DB here; saving happens via saveSettings.
      // The purpose is to provide a valid default config to the application.
      const defaultSettingsDoc = new HtmlCleanerSettings({ shopId });
      settings = defaultSettingsDoc.toObject(); // Convert to plain object

      // Clean up MongoDB specific fields for the newly created default object representation
      delete settings._id;
      delete settings.__v;
      if (settings.createdAt) delete settings.createdAt; // Will be set by mongoose on actual save
      if (settings.updatedAt) delete settings.updatedAt; // Will be set by mongoose on actual save
    } else {
      // If settings were found and fetched with .lean(), _id and __v might still be there.
      // For consistency in the returned object, we can remove them.
      delete settings._id;
      delete settings.__v;
    }
    return settings;
  } catch (error) {
    console.error(
      `Error fetching HTML cleaner settings for shop ${shopId}:`,
      error
    );
    throw error;
  }
};

/**
 * Saves or updates HTML cleaner settings for a given shop.
 * @param {string} shopId - The ID of the shop.
 * @param {object} settingsData - The settings data to save.
 * @returns {Promise<object>} - The saved settings object, excluding MongoDB-specific fields.
 */
const saveSettings = async (shopId, settingsData) => {
  if (!shopId) {
    throw new Error("shopId is required to save HTML cleaner settings.");
  }
  if (!settingsData || typeof settingsData !== "object") {
    throw new Error(
      "settingsData is required and must be an object for HTML cleaner."
    );
  }

  try {
    const updatedSettings = await HtmlCleanerSettings.findOneAndUpdate(
      { shopId },
      { ...settingsData, shopId }, // Ensure shopId is explicitly set
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean(); // .lean() returns a plain JS object

    if (updatedSettings) {
      delete updatedSettings._id;
      delete updatedSettings.__v;
    }

    return updatedSettings;
  } catch (error) {
    console.error(
      `Error saving HTML cleaner settings for shop ${shopId}:`,
      error
    );
    throw error;
  }
};

export default {
  getSettings,
  saveSettings,
};
