import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "public");

app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Site no ar na porta ${port}`);
});
