"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedVariations, setSavedVariations] = useState<
    Array<{ id: number; text: string }>
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch saved variations on load
  useEffect(() => {
    fetchSavedVariations();
  }, []);

  const fetchSavedVariations = async () => {
    const { data, error } = await supabase
      .from("saved_variations")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setSavedVariations(data);
  };

  const saveVariation = async (text: string) => {
    const { data, error } = await supabase
      .from("saved_variations")
      .insert([{ text }])
      .select();

    if (data) {
      setSavedVariations([...savedVariations, data[0]]);
    }
  };

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

  // Add delete function
  const deleteVariation = async (id: number) => {
    const { error } = await supabase
      .from("saved_variations")
      .delete()
      .eq("id", id);

    if (!error) {
      setSavedVariations(savedVariations.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="relative min-h-screen">
      <main className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-400 to-orange-300">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            AI Text Remixer
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-2xl">
            Transform your text into multiple creative variations using advanced
            AI technology.
          </p>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full h-48 p-6 rounded-xl bg-white/10 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all text-white placeholder-white/50 text-lg backdrop-blur-sm"
            />

            <button
              onClick={handleRemix}
              disabled={isLoading}
              className="mt-6 w-full py-4 px-6 rounded-xl bg-white text-purple-600 font-semibold text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Remixes...</span>
                </div>
              ) : (
                "Generate Remixes"
              )}
            </button>

            {outputText && (
              <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-8">
                  Creative Variations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {outputText
                    .split("\n")
                    .slice(0, 4)
                    .map((remix, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all group"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-white">
                            Variation {index + 1}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveVariation(remix)}
                              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                              title="Save variation"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                window.open(
                                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                    remix
                                  )}`,
                                  "_blank"
                                )
                              }
                              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                              title="Share on Twitter"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(remix)
                              }
                              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                              title="Copy to clipboard"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-white/80 text-lg leading-relaxed">
                          {remix}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Saved Variations Sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white/10 p-2 rounded-l-lg"
      >
        {isSidebarOpen ? "→" : "←"}
      </button>

      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Saved Variations
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10"
              title="Close sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {savedVariations.map((variation) => (
              <div
                key={variation.id}
                className="p-4 bg-white/5 rounded-lg group relative"
              >
                <p className="text-white/80">{variation.text}</p>
                <button
                  onClick={() => deleteVariation(variation.id)}
                  className="absolute top-2 right-2 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                  title="Delete variation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
