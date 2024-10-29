import React, { useReducer, createContext, useContext, useMemo } from "react";

const initialState = {
  images: [],
};

export const ImageCompressionContext = createContext(initialState);

ImageCompressionContext.displayName = "ImageCompressionContext";

function imageCompressionReducer(state, action) {
  switch (action.type) {
    case "SET_IMAGES":
      return { ...state, images: action.payload };

    default:
      return state;
  }
}

export const ImageCompressionProvider = (props) => {
  const [state, dispatch] = useReducer(imageCompressionReducer, initialState);

  const setImages = (payload) => dispatch({ type: "SET_IMAGES", payload });

  const value = useMemo(
    () => ({
      ...state,
      setImages,
    }),
    [state]
  );

  return <ImageCompressionContext.Provider value={value} {...props} />;
};

export const useImageCompression = () => {
  const context = useContext(ImageCompressionContext);
  if (!context) {
    throw new Error("useImageCompression must be used within an ImageCompressionProvider");
  }
  return context;
};

export const ManagedImageCompressionContext = ({ children }) => (
  <ImageCompressionProvider>{children}</ImageCompressionProvider>
);
