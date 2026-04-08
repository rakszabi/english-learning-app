const statsService = require("./stats.service");

class StatsController {
  async getDailyActivity(req, res) {
    try {
      const days = Math.min(parseInt(req.query.days) || 30, 90);
      const data = await statsService.getDailyActivity(req.decoded.id, days);
      res.json({ status: "SUCCESS", data });
    } catch (error) {
      res.status(500).json({ status: "FAILED", message: "Stat lekérdezés sikertelen." });
    }
  }
}

module.exports = new StatsController();
