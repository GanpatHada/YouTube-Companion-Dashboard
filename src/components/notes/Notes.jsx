import { useEffect, useState } from "react";
import "./Notes.css";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";

const AddNote = ({ setNotes }) => {
  const { state: user } = useUser();
  const [newNote, setNewNote] = useState("");
  const [newTags, setNewTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!user.user) return toast.error("Please login to add note");

    const trimmedNote = newNote.trim();
    if (!trimmedNote) return;

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setSubmitting(true);
    try {
      const res = await fetch(
        "https://youtube-companion-dashboard-backend.onrender.com/api/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.user.name,
            note: trimmedNote,
            tags: tagsArray,
            email: user.user.email,
            userId: user.user.id,
          }),
        }
      );

      const result = await res.json();
      const createdNote = result?.data;

      if (createdNote && createdNote._id) {
        setNotes((prev) => [createdNote, ...prev]);
        setNewNote("");
        setNewTags("");
        toast.success("Note added!");
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-note-box">
      <textarea
        placeholder="Write your note here..."
        rows={3}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter tags (comma separated)"
        value={newTags}
        onChange={(e) => setNewTags(e.target.value)}
      />

      <button
        onClick={handleAddNote}
        disabled={!newNote.trim() || submitting}
        className="primary-btn"
      >
        {submitting ? "Adding..." : "Add Note"}
      </button>
    </div>
  );
};

const SearchBox = ({ searchTag, setSearchTag }) => {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search by tag..."
        value={searchTag}
        onChange={(e) => setSearchTag(e.target.value)}
      />
    </div>
  );
};

const Note = ({ note }) => {
  return (
    <div className="note-card">
      <h4>{note.name}</h4>
      <span>{note.email}</span>
      <p>{note.note}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, idx) => (
            <span key={idx}>{tag}</span>
          ))}
        </div>
      )}

      <span className="note-date">
        {new Date(note.createdAt).toLocaleString()}
      </span>
    </div>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTag, setSearchTag] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await fetch(
        "https://youtube-companion-dashboard-backend.onrender.com/api/notes"
      );
      const result = await res.json();
      setNotes(result.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) =>
    searchTag.trim() === ""
      ? true
      : note.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTag.toLowerCase())
        )
  );

  return (
    <div id="notes">
      <h2>Notes</h2>
      <AddNote setNotes={setNotes} />
      <header>
        <h3>All Notes</h3>
        <SearchBox searchTag={searchTag} setSearchTag={setSearchTag} />
      </header>
      
      {loading ? (
        <p className="loading">Loading notes...</p>
      ) : filteredNotes.length === 0 ? (
        <p className="empty">No notes found.</p>
      ) : (
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <Note note={note} key={note._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
