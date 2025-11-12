import { readFile, writeFile } from "fs/promises";
import xlsx from "xlsx";
import path from "path";

export async function POST() {
  try {
    const filePath = path.resolve("translations.xlsx");
    const fileBuffer = await readFile(filePath);
    const workbook = xlsx.read(fileBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = xlsx.utils.sheet_to_json(sheet);

    const languages = Object.keys(json[0]).filter(k => k !== "key");

    for (const lang of languages) {
      const langJson = {};
      json.forEach(row => {
        const k = row["key"];
        const v = row[lang];
        if (k && v) langJson[k] = v;
      });
      const file = path.resolve("public/locales", lang + ".json");
      await writeFile(file, JSON.stringify(langJson, null, 2));
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
