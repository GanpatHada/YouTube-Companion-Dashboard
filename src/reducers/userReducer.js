export const initialUserState = {
  user: null,
  loading: false,
};


export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };

    case "CLEAR_USER":
      return { ...state, user: null, loading: false };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};
