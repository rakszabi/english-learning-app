const DialoguePractice = require("../dialogue/models/dialogue-practice.model");
const User = require("../user/models/user.model");

class StatsService {
  /**
   * Core series: last `days` days, oldest → newest (last index = "today" in server-local bucket logic).
   */
  async _computeDailySeries(userId, days) {
    const allPractices = await DialoguePractice.findAll({
      where: { userId },
      attributes: ["id", "dialogueId", "learningDate"],
      order: [["id", "ASC"]],
    });

    const firstPracticeId = new Map();
    for (const p of allPractices) {
      if (!firstPracticeId.has(p.dialogueId)) {
        firstPracticeId.set(p.dialogueId, p.id);
      }
    }

    const dateMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, { date: key, newCount: 0, reviewCount: 0 });
    }

    for (const p of allPractices) {
      const entry = dateMap.get(p.learningDate);
      if (!entry) continue;

      if (firstPracticeId.get(p.dialogueId) === p.id) {
        entry.newCount++;
      } else {
        entry.reviewCount++;
      }
    }

    return Array.from(dateMap.values());
  }

  _goalInsight(target, done) {
    if (target == null || target <= 0) return null;
    const remaining = Math.max(0, target - done);
    return {
      target,
      done,
      remaining,
      met: done >= target,
      percent: Math.min(100, Math.round((done / target) * 1000) / 10),
    };
  }

  /**
   * Daily activity + profile goals + today's progress + light pacing hints.
   */
  async getDailyActivity(userId, days = 30) {
    const series = await this._computeDailySeries(userId, days);

    const user = await User.findByPk(userId, {
      attributes: ["dailyNewDialoguesGoal", "dailyPracticeGoal"],
    });
    const u = user ? user.toJSON() : {};

    const goals = {
      dailyNewDialogues:
        u.dailyNewDialoguesGoal != null && Number.isFinite(Number(u.dailyNewDialoguesGoal))
          ? Number(u.dailyNewDialoguesGoal)
          : null,
      dailyPracticeSessions:
        u.dailyPracticeGoal != null && Number.isFinite(Number(u.dailyPracticeGoal))
          ? Number(u.dailyPracticeGoal)
          : null,
    };

    const todayRow = series.length > 0 ? series[series.length - 1] : null;
    const today = todayRow
      ? {
          date: todayRow.date,
          newCount: todayRow.newCount,
          reviewCount: todayRow.reviewCount,
          totalSessions: todayRow.newCount + todayRow.reviewCount,
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          newCount: 0,
          reviewCount: 0,
          totalSessions: 0,
        };

    const last7 = series.slice(-7);
    const n = Math.max(1, last7.length);
    const weeklyAvgNew =
      Math.round((last7.reduce((s, d) => s + d.newCount, 0) / n) * 10) / 10;
    const weeklyAvgSessions =
      Math.round(
        (last7.reduce((s, d) => s + d.newCount + d.reviewCount, 0) / n) * 10
      ) / 10;

    const newInsight = this._goalInsight(goals.dailyNewDialogues, today.newCount);
    const practiceInsight = this._goalInsight(
      goals.dailyPracticeSessions,
      today.totalSessions
    );

    const onTrack = (avg, goal) => {
      if (goal == null || goal <= 0) return null;
      return avg >= goal * 0.85;
    };

    const insights = {
      newDialogues: newInsight,
      practiceSessions: practiceInsight,
      weeklyAvgNew,
      weeklyAvgSessions,
      weekOnTrackNew: onTrack(weeklyAvgNew, goals.dailyNewDialogues),
      weekOnTrackPractice: onTrack(weeklyAvgSessions, goals.dailyPracticeSessions),
    };

    return { series, goals, today, insights };
  }
}

module.exports = new StatsService();
