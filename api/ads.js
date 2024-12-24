import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "public", "ads.txt");
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(fileContents);
  } catch (error) {
    res.status(404).send("ads.txt not found");
  }
}
