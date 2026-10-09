// Copies public/ and .next/static into .next/standalone so the folder runs on its own.
import { cpSync, existsSync } from "node:fs";
const out = ".next/standalone";
if (existsSync("public")) cpSync("public", `${out}/public`, { recursive: true });
cpSync(".next/static", `${out}/.next/static`, { recursive: true });
console.log("postbuild: copied public/ and .next/static into", out);
