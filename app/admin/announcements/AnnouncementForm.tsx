"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AnnouncementForm() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("0");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter an announcement title.");
      }

      if (!message.trim()) {
        throw new Error("Please enter the announcement message.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in as an admin.");
      }

      const { error: insertError } = await supabase
        .from("announcements")
        .insert({
          title: title.trim(),
          message: message.trim(),
          priority: Number(priority),
          published,
          created_by: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      setTitle("");
      setMessage("");
      setPriority("0");
      setPublished(true);

      setSuccess("Announcement published successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create announcement."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Announcement Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chanda Collection Open"
          required
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Message
        </label>

        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter the announcement details..."
          required
          rows={6}
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {/* Priority */}
      <div>
        <label
          htmlFor="priority"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Priority
        </label>

        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          <option value="0">Normal</option>
          <option value="1">Important</option>
          <option value="2">Urgent</option>
        </select>
      </div>

      {/* Published */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 accent-orange-600"
        />

        <span className="text-sm font-medium text-gray-700">
          Publish immediately
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Announcement"}
      </button>
    </form>
  );
}