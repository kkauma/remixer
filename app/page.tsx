"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRemix = async () => {
    setIsLoading(true);
    setError("");
    setOutputText("");

    try {
      const response = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOutputText(data.remixedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remix content");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Content Remix Tool</h1>

      <textarea
        className="w-full h-40 p-2 border rounded mb-4 text-black placeholder-gray-500"
        placeholder="Paste your content here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600"
        onClick={handleRemix}
        disabled={isLoading || !inputText}
      >
        {isLoading ? "Remixing..." : "Remix Content"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {outputText && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Remixed Content:</h2>
          <div className="p-4 border rounded bg-gray-50 text-black">
            {outputText}
          </div>
        </div>
      )}
    </main>
  );
}
