import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});