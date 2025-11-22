"use client";

import { useState } from "react";
import ResponseDisplay from "./components/ResponseDisplay";

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchResponse = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/response");
      const data = await res.json();

      if (data.success && data.data?.data?.choices?.[0]?.message?.content) {
        setResponse(data.data.data.choices[0].message.content);
        setRetryCount(0); // Reset retry count on success
      } else if (!data.success && retryCount < 3) {
        setResponse(null);
        setRetryCount((prev) => prev + 1);
        // Retry after 10 seconds if under retry limit
        setTimeout(fetchResponse, 10000);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-900">
      {/* GET Button */}
      <button
        onClick={fetchResponse}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:bg-blue-300"
      >
        {loading ? "Loading..." : "GET Response"}
      </button>

      {/* Response Display */}
      <div className="rounded-lg bg-gray-800 min-h-[200px] shadow-inner mt-4 p-4 overflow-hidden">
        {response ? (
          <ResponseDisplay content={response} />
        ) : (
          <p className="text-center text-gray-100">
            {loading
              ? "Loading..."
              : retryCount >= 3
              ? "No response available after 3 attempts"
              : "Just wait for a moment"}
          </p>
        )}
      </div>
    </div>
  );
}
