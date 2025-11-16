
import { createContext, useContext, useReducer } from "react";
import { videoReducer, initialVideoState } from "../reducers/videoReducer";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(videoReducer, initialVideoState);

  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) throw new Error("useVideo must be used within a VideoProvider");
  return context;
};
