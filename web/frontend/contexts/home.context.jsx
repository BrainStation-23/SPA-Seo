import React from "react";

const initialState = {
  organization: {
    industry: [],
    brand: { name: "", logo: "" },
    logo: "",
    showContact: false,
    showVariants: false,
    businessType: "Organization",
    priceRange: [100, 1000],
    status: false,
    socialLinks: {
      facebook: null,
      twitter: null,
      instagram: null,
      youtube: null,
      pinterest: null,
      linkedin: null,
      snapchat: null,
      tiktok: null,
    },
  },
  rating: {},
  reviews: [],
};

export const HomePageSeoContext = React.createContext(initialState);

HomePageSeoContext.displayName = "HomePageSeoContext";

function homeSeoReducer(state, action) {
  switch (action.type) {
    case "SET_ORG": {
      return {
        ...state,
        organization: action.payload,
      };
    }
    case "SET_RATE": {
      return {
        ...state,
        rating: action.payload,
      };
    }
    case "SET_REVIEW": {
      return {
        ...state,
        reviews: action.payload,
      };
    }
  }
}

export const HomeSeoProvider = (props) => {
  const [state, dispatch] = React.useReducer(homeSeoReducer, initialState);

  const setOrganization = (payload) => dispatch({ type: "SET_ORG", payload });
  const setRating = (payload) => dispatch({ type: "SET_RATE", payload });
  const setReviews = (payload) => dispatch({ type: "SET_REVIEW", payload });

  const value = React.useMemo(
    () => ({
      ...state,
      setOrganization,
      setRating,
      setReviews,
    }),
    [state]
  );
  return <HomePageSeoContext.Provider value={value} {...props} />;
};

export const useHomeSeo = () => {
  const context = React.useContext(HomePageSeoContext);
  if (context === undefined) {
    throw new Error(`useHomeSeo must be used within a HomeSeoProvider`);
  }
  return context;
};

export const ManagedHomeSeoContext = ({ children }) => (
  <HomeSeoProvider>{children}</HomeSeoProvider>
);
