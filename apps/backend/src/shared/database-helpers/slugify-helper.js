const { default: slugify } = require("slugify");
const { Op } = require("sequelize");

// Helper függvény az egyedi slug generálásához
const generateUniqueSlug = async (model, baseSlug, id = null) => {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    // WHERE feltétel összeállítása
    const whereCondition = { slug };
    if (id) {
      whereCondition.id = { [Op.ne]: id }; // ID kizárása frissítéskor
    }

    // Ellenőrizd, hogy létezik-e már ilyen slug
    const existing = await model.findOne({
      where: whereCondition,
    });

    if (!existing) break; // Ha nem létezik, kilépünk a ciklusból

    // Ha létezik, növeld az inkrementálót
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

const customSlugify = async (model, baseName, id) => {
  const baseSlug = slugify(baseName, {
    lower: true,
    strict: true,
  });

  return await generateUniqueSlug(model, baseSlug, id); // Egyedi slug generálása
};

module.exports = { customSlugify };
