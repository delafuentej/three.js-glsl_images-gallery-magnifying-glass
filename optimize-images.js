import sharp from "sharp";
import fs from "fs";
import path from "path";

const imagesDir = "./public/images";
const outputDir = "./public/images/optimized";

// Crear carpeta optimized si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(imagesDir).forEach((file) => {
  if (file.endsWith(".webp")) {
    // Ajusta las dimensiones según el tamaño máximo mostrado en la web
    const width = 226; // retina (2x)
    const height = 340; // retina (2x)

    sharp(path.join(imagesDir, file))
      .resize(width, height, {
        fit: "inside", // mantiene proporción
        withoutEnlargement: true,
      })
      .webp({ quality: 80 }) // puedes bajar a 70 si quieres archivos más pequeños
      .toFile(path.join(outputDir, file))
      .then(() => console.log(`${file} optimizada ✔`))
      .catch((err) => console.error(err));
  }
});
