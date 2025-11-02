import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPage, setSelectedPage] = useState("LaoPride"); // ✅ default page
  const [search, setSearch] = useState("");
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    axios
      .get("https://web-production-b01ad.up.railway.app/posts")
      .then((res) => {
        // ✅ Assign LaoPride as default Page_Name if missing
        const withPageNames = res.data.map((p) => ({
          ...p,
          Page_Name:
            p.Page_Name && p.Page_Name.trim() !== "" ? p.Page_Name : "LaoPride",
        }));
        setPosts(withPageNames);
      })
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  // ✅ Extract unique page names dynamically
  const pageNames = [...new Set(posts.map((p) => p.Page_Name))];

  // ✅ Filter by selected page
  const filteredPosts =
    selectedPage === "All"
      ? posts
      : posts.filter(
          (p) =>
            p.Page_Name &&
            p.Page_Name.toLowerCase().replace(/\s/g, "") ===
              selectedPage.toLowerCase().replace(/\s/g, "")
        );

  // ✅ Search filter
  const visiblePosts = filteredPosts.filter((p) =>
    p.Post_Content.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Toggle expand/collapse comments
  const toggleComments = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        EmotionLens: Facebook Posts & Comments Analyzer
      </h1>

      {/* 🔹 Page Filter + Search Bar */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
        <select
          className="border px-4 py-2 rounded-md shadow-sm"
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
        >
          <option value="All">All Pages</option>
          {pageNames.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Search post..."
          className="border px-4 py-2 rounded-md shadow-sm w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🔹 Post Cards */}
      {visiblePosts.map((p, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          {/* Post Header */}
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-lg mb-1 text-gray-800 leading-snug">
              {p.Post_Content}
            </h2>
            <p className="text-sm text-gray-500">{p.Created_Time}</p>
          </div>

          {/* Page Name */}
          <p className="text-sm text-blue-500 font-medium mb-2">
            📘 {p.Page_Name}
          </p>

          {/* Reaction counts */}
          <div className="flex gap-4 mt-2 text-sm">
            <span>👍 {p.Reaction_Count}</span>
            <span>💬 {p.Comment_Count}</span>
            <span>🔁 {p.Share_Count}</span>
          </div>

          {/* Sentiment Pie Chart */}
          <div className="mt-6 flex flex-col items-center">
            <PieChart width={220} height={220}>
              <Pie
                dataKey="value"
                data={[
                  { name: "Positive", value: p.Positive },
                  { name: "Neutral", value: p.Neutral },
                  { name: "Negative", value: p.Negative },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#4ade80" /> {/* Positive */}
                <Cell fill="#facc15" /> {/* Neutral */}
                <Cell fill="#f87171" /> {/* Negative */}
              </Pie>
              <Tooltip />
            </PieChart>

            {/* Legend */}
            <div className="flex justify-center flex-wrap gap-6 mt-4 text-sm font-medium">
              <div className="flex items-center gap-1 text-red-400">
                <span className="w-3 h-3 bg-red-400 inline-block rounded-sm"></span>
                Negative
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="w-3 h-3 bg-yellow-400 inline-block rounded-sm"></span>
                Neutral
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-3 h-3 bg-green-400 inline-block rounded-sm"></span>
                Positive
              </div>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => toggleComments(p.Post_ID)}
              className="text-blue-600 font-medium hover:underline"
            >
              {expandedPost === p.Post_ID ? "Hide Comments ▲" : "View Comments ▼"}
            </button>
          </div>

          {/* Animated Comments */}
          <AnimatePresence>
            {expandedPost === p.Post_ID && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="mt-4 border-t pt-4 space-y-2 overflow-hidden"
              >
                {p.Details?.split("\n\n").map((commentBlock, idx) => {
                  const match = commentBlock.match(/sentiment:\s*(\w+)/i);
                  const sentiment = match ? match[1].toLowerCase() : "neutral";
                  const sentimentColor =
                    sentiment === "positive"
                      ? "text-green-600 bg-green-50 border-green-200"
                      : sentiment === "negative"
                      ? "text-red-600 bg-red-50 border-red-200"
                      : "text-yellow-600 bg-yellow-50 border-yellow-200";

                  const cleanComment = commentBlock
                    .replace(/comment:\s*/i, "")
                    .replace(/sentiment:\s*\w+/i, "")
                    .trim();

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className={`border rounded-lg p-3 text-sm ${sentimentColor}`}
                    >
                      💬 {cleanComment}
                      <span className="float-right font-semibold capitalize">
                        {sentiment}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* No Results */}
      {visiblePosts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No posts found. Try another keyword or page.
        </p>
      )}
    </div>
  );
}

export default App;
