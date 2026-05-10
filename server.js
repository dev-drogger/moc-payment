import express from "express";
import dotenv from "dotenv";
import router from "./routes/paypal.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());
app.use(
  cors({
    // origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    origin: "*",
    methods: ["GET", "POST"],
  }),
);
app.use("/paypal", router);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Payment server is running on port ${PORT}`);
});
