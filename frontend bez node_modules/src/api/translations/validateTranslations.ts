import { readFile, readdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const baseLang = "pl";
    const dir = path.resolve("public/locales");
    const files = (await readdir(dir)).filter(f => f.endsWith(".json"));

    const translations = {};
    for (const file of files) {
      const lang = file.replace(".json", "");
      const content = await readFile(path.join(dir, file), "utf-8");
      translations[lang] = JSON.parse(content);
    }

    const baseKeys = Object.keys(translations[baseLang] || {});
    const missing = [];

    baseKeys.forEach(key => {
      Object.entries(translations).forEach(([lang, dict]) => {
        if (lang === baseLang) return;
        if (!dict[key]) {
          missing.push({ lang, key });
        }
      });
    });

    return new Response(JSON.stringify({ missing }));
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ missing: [], error: true }), { status: 500 });
  }
}
