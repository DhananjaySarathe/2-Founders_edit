import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, sep, extname } from "node:path";
const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT || 8000);
const source = await readFile(resolve(root, "api/geo.js"), "utf8");
const { default: geo } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405).end();
        return;
      }
      if (url.pathname === "/api/geo") {
        const result = await geo(new Request(url, { headers: req.headers }));
        res.writeHead(result.status, Object.fromEntries(result.headers));
        res.end(req.method === "HEAD" ? undefined : await result.text());
        return;
      }
      let file = resolve(root, "." + decodeURIComponent(url.pathname));
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      if (url.pathname.split("/").some((p) => p.startsWith("."))) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const info = await stat(file);
      const headers = {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Accept-Ranges": "bytes",
      };
      if (url.pathname.startsWith("/media/"))
        headers["Cache-Control"] = "public, max-age=604800";
      let start = 0,
        end = info.size - 1,
        status = 200;
      if (req.headers.range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if (!match) {
          res.writeHead(416, { "Content-Range": "bytes */" + info.size }).end();
          return;
        }
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), end) : end;
        if (start > end || start >= info.size) {
          res.writeHead(416, { "Content-Range": "bytes */" + info.size }).end();
          return;
        }
        status = 206;
        headers["Content-Range"] =
          "bytes " + start + "-" + end + "/" + info.size;
      }
      headers["Content-Length"] = end - start + 1;
      res.writeHead(status, headers);
      if (req.method === "HEAD") res.end();
      else createReadStream(file, { start, end }).pipe(res);
    } catch (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500).end();
      if (error.code !== "ENOENT") console.error(error.message);
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("Local: http://127.0.0.1:" + port),
  );
