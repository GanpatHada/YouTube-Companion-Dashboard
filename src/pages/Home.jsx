import { Toaster } from "react-hot-toast";
import Navbar from "../components/navbar/Navbar";
import Video from "../components/video/Video";
import Comments from "../components/comments/Comments";
import Notes from "../components/notes/Notes";

const Home = () => {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <div id="app-content">
        <Video />
        <Comments />
      </div>
      <Notes />
    </div>
  );
};

export default Home;
