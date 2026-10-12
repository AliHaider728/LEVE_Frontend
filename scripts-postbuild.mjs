// Package static assets beside the standalone server, including isolated builds.
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
const dist = process.env.NEXT_DIST_DIR || ".next";
const out = path.join(dist, "standalone");
if (existsSync("public")) cpSync("public", path.join(out, "public"), { recursive: true });
cpSync(path.join(dist, "static"), path.join(out, dist, "static"), { recursive: true });
console.log("postbuild: copied public/ and " + dist + "/static into " + out);
