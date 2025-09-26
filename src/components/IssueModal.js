import React, { useState } from "react";

export default function IssueModal({ isOpen, onClose, onAlert }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      // Prefer the in-app alert function passed from App; fall back to browser alert
      if (onAlert) onAlert("Please enter a title.");
      else window.alert("Please enter a title.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      if (res.ok) {
        onAlert("✅ Issue created on GitHub!");
        setTitle("");
        setBody("");
        onClose();
      } else {
        const err = await res.text();
        console.error("❌ Failed: " + err);
        onAlert("❌ Error creating issue. Please try again later.");
        onClose();
      }
    } catch (err) {
      console.error(err);
      onAlert("❌ Error creating issue. Please try again later.");
      onClose();
    } finally {
      setLoading(false);
      setBody("");
      setTitle("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Feature/Issue Reporting</h2>

        <input
          type="text"
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Describe the issue..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}