import React, { useState } from "react";

export default function IssueModal({ isOpen, onClose, onAlert }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (category) => {
    if (!title.trim()) {
      if (onAlert) onAlert("Please enter a title.");
      else window.alert("Please enter a title.");
      return;
    }

    const fullTitle = `[${category}] ${title}`;

    setLoading(true);
    try {
      const res = await fetch("/api/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: fullTitle, body }),
      });

      if (res.ok) {
        onAlert("✅ Issue created on GitHub!");
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
      setDropdownOpen(false);
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
          className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="flex justify-end space-x-3 relative">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          {/* Dropdown wrapper */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {dropdownOpen && !loading && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleSubmit("Issue")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Submit as Issue
                </button>
                <button
                  onClick={() => handleSubmit("Request")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Submit as Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}