import React from "react";

const initialState = {
  shop: {},
  modal: {
    view: undefined,
    isOpen: false,
    data: null,
  },
  toast: {
    active: false,
    message: "",
  },
  useAI: {
    active: false,
    data: null,
  },
  appBilling: {},
  speedInsights: {},
};

export const UIContext = React.createContext(initialState);

UIContext.displayName = "UIContext";

function uiReducer(state, action) {
  switch (action.type) {
    case "SET_SHOP": {
      return {
        ...state,
        shop: action.payload,
      };
    }
    case "OPEN_MODAL": {
      return {
        ...state,
        modal: {
          ...state.modal,
          view: action.payload.view,
          isOpen: action.payload.isOpen,
          data: action.payload.data,
        },
      };
    }
    case "CLOSE_MODAL": {
      return {
        ...state,
        modal: {
          ...state.modal,
          view: undefined,
          isOpen: false,
          data: null,
        },
      };
    }
    case "TOGGLE_TOAST": {
      return {
        ...state,
        toast: {
          ...state.toast,
          active: action.payload.active,
          message: action.payload.message,
        },
      };
    }

    case "TOGGLE_AI": {
      return {
        ...state,
        useAI: {
          ...state.useAI,
          active: action.payload.active,
          data: action.payload.data,
        },
      };
    }

    case "SET_STORE_INFO": {
      return {
        ...state,
        appBilling: action?.payload?.billing,
        speedInsights: action?.payload?.speedInsights,
      };
    }

    case "UPDATE_SPEED_INSIGHTS": {
      return {
        ...state,
        speedInsights: {
          ...state?.speedInsights,
          ...action?.payload,
        },
      };
    }
  }
}

export const UIProvider = (props) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState);

  const setShop = (payload) => dispatch({ type: "SET_SHOP", payload });
  const setOpenModal = (payload) => dispatch({ type: "OPEN_MODAL", payload });
  const setCloseModal = () => dispatch({ type: "CLOSE_MODAL" });
  const setToggleToast = (payload) =>
    dispatch({ type: "TOGGLE_TOAST", payload });

  const setToggleAIButton = (payload) =>
    dispatch({ type: "TOGGLE_AI", payload });

  const setStoreInfo = (payload) =>
    dispatch({ type: "SET_STORE_INFO", payload });
  const setSpeedInsights = (payload) =>
    dispatch({ type: "UPDATE_SPEED_INSIGHTS", payload });

  const value = React.useMemo(
    () => ({
      ...state,
      setShop,
      setOpenModal,
      setCloseModal,
      setToggleToast,
      setToggleAIButton,
      setStoreInfo,
      setSpeedInsights,
    }),
    [state]
  );
  return <UIContext.Provider value={value} {...props} />;
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`);
  }
  return context;
};

export const ManagedUIContext = ({ children }) => (
  <UIProvider>{children}</UIProvider>
);
