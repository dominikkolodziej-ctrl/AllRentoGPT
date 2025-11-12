import { readdirSync, readFileSync } from "fs";
import xlsx from "xlsx";
import path from "path";

export async function GET() {
  try {
    const dir = path.resolve("public/locales");
    const files = readdirSync(dir).filter(f => f.endsWith(".json"));
    const langData = {};

    files.forEach(file => {
      const lang = file.replace(".json", "");
      const content = JSON.parse(readFileSync(path.join(dir, file), "utf-8"));
      Object.entries(content).forEach(([key, value]) => {
        if (!langData[key]) {
          langData[key] = {};
        }
        langData[key][lang] = value;
      });
    });

    const rows = Object.entries(langData).map(([key, langs]) => {
      const merged = Object.entries(langs).reduce((acc, [lang, val]) => {
        acc[lang] = val;
        return acc;
      }, {});
      return { key, ...merged };
    });

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Translations");

    const fileBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=translations.xlsx"
      }
    });
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
