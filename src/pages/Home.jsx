import Video from "../components/video/Video";
import Comments from "../components/comments/Comments";
import Notes from "../components/notes/Notes";

const Home = () => {
  return (
    <div id="home">
      <Video />
      <Comments />
      <Notes />
    </div>
  );
};

export default Home;
