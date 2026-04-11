const logger = require("../logger");

/**
 * Broken `learningInterests` (MySQL JSON or MariaDB JSON-as-LONGTEXT + CHECK) can
 * make every `ALTER TABLE Users` fail during sequelize.sync({ alter: true }).
 * Prefer in-place TEXT conversion; if that fails, drop the column so sync can recreate it.
 */
async function fixUserLearningInterestsColumn(sequelize) {
  try {
    const [rows] = await sequelize.query(
      `SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'Users'
         AND COLUMN_NAME = 'learningInterests'`
    );
    if (!rows || rows.length === 0) return;

    const dataType = String(rows[0].DATA_TYPE || "").toLowerCase();

    // Already a normal string column (MariaDB "JSON" is stored as LONGTEXT — still try MODIFY below)
    if (
      dataType === "text" ||
      dataType === "mediumtext" ||
      dataType === "varchar" ||
      dataType === "char"
    ) {
      return;
    }

    try {
      await sequelize.query(
        "ALTER TABLE `Users` MODIFY COLUMN `learningInterests` TEXT NULL DEFAULT '[]'"
      );
      logger.info("Normalized Users.learningInterests column to TEXT.");
      return;
    } catch (modifyErr) {
      logger.warn(
        `Could not MODIFY learningInterests to TEXT (${modifyErr.message}); trying DROP.`
      );
    }

    await sequelize.query("ALTER TABLE `Users` DROP COLUMN `learningInterests`");
    logger.info(
      "Dropped Users.learningInterests; sequelize sync will recreate it as TEXT."
    );
  } catch (err) {
    logger.warn(`fixUserLearningInterestsColumn: ${err.message}`);
  }
}

module.exports = { fixUserLearningInterestsColumn };
