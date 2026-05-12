import express from "express";
import router from "./routes/paypal.js";
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());
app.use(morgan("dev"));
app.use((err, req, res, next) => {
  console.log("=== Incoming Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("========================");
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
  next();
});
app.use(
  cors({
    // origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    origin: "*",
    methods: ["GET", "POST"],
  }),
);
app.use("/paypal", router);

app.listen(PORT, () => {
  console.log(`Payment server is running on port ${PORT}`);
});
