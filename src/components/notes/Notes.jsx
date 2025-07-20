import React, { useEffect, useState } from "react";
import "./Notes.css";
import toast from "react-hot-toast";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddNote = async () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;

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
            name: "anonymous",
            note: trimmed,
          }),
        }
      );

      const result = await res.json();
      const createdNote = result?.data;

      if (createdNote && createdNote._id) {
        setNotes((prev) => [createdNote, ...prev]);
        setNewNote("");
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
        <button
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
        >
          {submitting ? "Adding..." : "Add Note"}
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="empty">No notes found.</p>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <h4>{note.name}</h4>
              <p>{note.note}</p>
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
