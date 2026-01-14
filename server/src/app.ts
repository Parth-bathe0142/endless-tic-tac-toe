import express from "express";
import cors from "cors";
import path from "path";

export const app = express();

app.use(cors())
app.use(express.static(path.join(__dirname, "../../client/dist")))

app.use((_, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"))
})
