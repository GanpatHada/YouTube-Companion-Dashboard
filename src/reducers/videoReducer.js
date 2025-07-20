
export const initialVideoState = {
  loading: false,
  videoInfo: null,
};

export function videoReducer(state, action) {
  switch (action.type) {
    case "VIDEO_FETCH_START":
      return { ...state, loading: true };

    case "VIDEO_FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        videoInfo: action.payload.videoInfo,
      };
    default:
      return state;
  }
}
