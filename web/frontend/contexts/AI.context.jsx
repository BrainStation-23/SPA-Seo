import React from "react";

const initialState = {
  productSeo: {},
};

export const AIContext = React.createContext(initialState);

AIContext.displayName = "UIContext";

function uiReducer(state, action) {
  switch (action.type) {
    case "SET_PRODUCT_SEO": {
      return {
        ...state,
        productSeo: {
          ...action.payload,
        },
      };
    }
  }
}

export const AIProvider = (props) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState);

  const setProductSeo = (payload) =>
    dispatch({ type: "SET_PRODUCT_SEO", payload });

  const value = React.useMemo(
    () => ({
      ...state,
      setProductSeo,
    }),
    [state]
  );
  return <AIContext.Provider value={value} {...props} />;
};

export const useAI = () => {
  const context = React.useContext(AIContext);
  if (context === undefined) {
    throw new Error(`useAI must be used within a AIProvider`);
  }
  return context;
};

export const ManagedAIContext = ({ children }) => (
  <AIProvider>{children}</AIProvider>
);
