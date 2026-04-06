const { Op } = require("sequelize");

async function queryDatabase({
  model,
  pagination = {},
  sort = {},
  search = {},
  filters = {},
  include = [],
  additionalWhere = {},
}) {
  const where = { ...additionalWhere };

  // ---- 🔍 SEARCH ----
  if (search?.query && search?.fields?.length) {
    const orConditions = [];

    for (const field of search.fields) {
      if (field.includes(".")) {
        orConditions.push({
          [`$${field}$`]: { [Op.like]: `%${search.query}%` },
        });
      } else {
        orConditions.push({
          [field]: { [Op.like]: `%${search.query}%` },
        });
      }
    }

    if (orConditions.length) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({ [Op.or]: orConditions });
    }
  }

  // ---- 🎯 FILTERS ----
  if (filters && typeof filters === "object") {
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        where[key] = { [Op.or]: value };
      } else if (typeof value === "object" && (value.from || value.to)) {
        const fromDate = value.from ? new Date(value.from) : null;
        const toDate = value.to ? new Date(value.to) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);
        where[key] = {
          [Op.between]: [fromDate, toDate].filter(Boolean),
        };
      } else {
        where[key] = value;
      }
    }
  }

  // ---- 📄 PAGINATION ----
  const limit = Number(pagination?.limit) || 10;
  const page = Number(pagination?.page) || 1;
  const offset = (page - 1) * limit;

  let sortField = sort?.column || "createdAt";
  const direction =
    (sort?.direction || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Ha nem létezik az adott mező, fallback
  if (!model.rawAttributes?.[sortField]) {
    sortField = "createdAt";
  }

  // Custom sort mezők kezelése
  let order;
  if (sort?.customSort) {
    // Ha van custom sort definiálva, azt használjuk
    order = sort.customSort;
  } else {
    // Egyébként a normál mező alapú rendezés
    order = [
      [sortField, direction],
      ["id", "DESC"], // stabil másodlagos rendezés
    ];
  }

  // 1️⃣ Egyedi ID-k lekérése
  const idResults = await model.findAll({
    attributes: ["id"],
    where,
    include,
    subQuery: false,
    order,
    raw: true,
  });

  const uniqueIds = [...new Set(idResults.map((r) => r.id))];
  const paginatedIds = uniqueIds.slice(offset, offset + limit);
  const total = uniqueIds.length;

  // 2️⃣ Lekérés ID alapján
  const rows = await model.findAll({
    where: { id: { [Op.in]: paginatedIds } },
    include,
    order,
  });

  return {
    data: rows,
    pagination: {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = queryDatabase;
