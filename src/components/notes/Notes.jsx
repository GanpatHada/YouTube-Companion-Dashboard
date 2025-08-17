import React, { useContext, useEffect, useState } from "react";
import "./Notes.css";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";

const Notes = () => {
  const { state: user } = useUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newTags, setNewTags] = useState(""); // comma-separated tags
  const [submitting, setSubmitting] = useState(false);
  const [searchTag, setSearchTag] = useState(""); // search input

  // Fetch notes from backend
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

  // Handle adding a new note
  const handleAddNote = async () => {
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
            tags: tagsArray, // send tags as array
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

      <div className="search-box" style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #444",
            backgroundColor: "#2a2a2a",
            color: "#e0e0e0",
          }}
        />
      </div>

      {loading ? (
        <p className="loading">Loading notes...</p>
      ) : filteredNotes.length === 0 ? (
        <p className="empty">No notes found.</p>
      ) : (
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div key={note._id} className="note-card">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
