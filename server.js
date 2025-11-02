import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the dist folder
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Railway/Render port config
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));