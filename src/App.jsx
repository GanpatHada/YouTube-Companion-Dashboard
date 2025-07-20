import { Toaster } from 'react-hot-toast'
import './App.css'
import Comments from './components/comments/Comments'
import Navbar from './components/navbar/Navbar'
import Video from './components/video/Video'
import Notes from './components/notes/Notes'
const App = () => {
  return (
    <div id='app'>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar/>
        <div id="app-content">
          <Video/>
        <Comments/>
        </div>
        <Notes/>
    </div>
  )
}

export default App
