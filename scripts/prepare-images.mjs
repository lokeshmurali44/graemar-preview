import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const source =
  process.argv[2] ||
  "C:/Users/Hxtreme/Downloads/LANDING PAGE PHOTOS (originals, full size)";
const destination = "assets/images/projects";
await mkdir(destination, { recursive: true });
await mkdir("assets/data", { recursive: true });
const manifest = {};
for (const file of (await readdir(source)).filter((file) =>
  /\.(jpe?g|png)$/i.test(file),
)) {
  const name = path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const sourceFile = path.join(source, file);
  const metadata = await sharp(sourceFile).metadata();
  const swapped = [5, 6, 7, 8].includes(metadata.orientation);
  const width = swapped ? metadata.height : metadata.width;
  const height = swapped ? metadata.width : metadata.height;
  const widths = [480, 640];
  for (const size of widths) {
    let data;
    for (const quality of [78, 70, 60, 50, 40]) {
      data = await sharp(sourceFile).rotate().resize({ width: size }).webp({ quality, effort: 6 }).toBuffer();
      if (data.length < 100000) break;
    }
    if (data.length >= 100000) throw new Error('Photo exceeds 100 KB: ' + name);
    await writeFile(destination + '/' + name + '-' + size + '.webp', data);
  }
  manifest[name] = { width, height, widths, source: file };
}
await writeFile("assets/data/images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Prepared ${Object.keys(manifest).length} original photos in two responsive sizes.`,
);
