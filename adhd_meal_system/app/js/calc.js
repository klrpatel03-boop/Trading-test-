/* ============================================================================
 * Anchor — calc.js
 * Nutrition + budget math. Pure functions. Attaches to window.Anchor.calc.
 * Educational framework only — not medical advice.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var ACTIVITY = {
    sedentary: 13,
    light: 14,
    moderate: 14.5,
    active: 16,
  };

  var calc = {
    /* Estimate maintenance + target calories/protein/fiber from the profile. */
    targets: function (profile) {
      profile = profile || {};
      var wt = +profile.weightLb || 160;
      var mult = ACTIVITY[profile.activity] || ACTIVITY.moderate;
      var maintenance = Math.round(wt * mult);

      var goal = profile.goal || "gain";
      var calories, surplus, proteinPerLb;
      if (goal === "gain") {
        surplus = 400;
        calories = maintenance + surplus;
        proteinPerLb = 1.0;
      } else if (goal === "cut") {
        surplus = -450;
        calories = maintenance + surplus;
        proteinPerLb = 1.0;
      } else {
        surplus = 0;
        calories = maintenance;
        proteinPerLb = 0.9;
      }

      var protein = Math.round(wt * proteinPerLb);
      // adequate, not maxed (high fiber fights a surplus when appetite is low)
      var fiber = Math.min(38, Math.max(28, Math.round((calories / 1000) * 12)));
      var fatG = Math.round((calories * 0.30) / 9);
      var proteinCals = protein * 4;
      var fatCals = fatG * 9;
      var carbG = Math.max(0, Math.round((calories - proteinCals - fatCals) / 4));

      return {
        weightLb: wt,
        goal: goal,
        maintenance: maintenance,
        surplus: surplus,
        calories: calories,
        protein: protein,
        fiber: fiber,
        fat: fatG,
        carbs: carbG,
        proteinPerLb: proteinPerLb,
        // weekly weight change guidance
        weeklyTarget: goal === "gain" ? "+0.25 to +0.5 lb/wk"
          : goal === "cut" ? "−0.5 to −1 lb/wk" : "steady",
      };
    },

    /* Sum macros + cost across a set of meals. */
    sumMeals: function (meals) {
      var t = { protein: 0, fiber: 0, carbs: 0, fat: 0, calories: 0, cost: 0 };
      meals.forEach(function (m) {
        if (!m) return;
        t.protein += m.protein || 0;
        t.fiber += m.fiber || 0;
        t.carbs += m.carbs || 0;
        t.fat += m.fat || 0;
        t.calories += m.calories || 0;
        t.cost += m.cost || 0;
      });
      return t;
    },

    /* How far a day's plan lands vs the user's targets (0..1+). */
    coverage: function (dayTotals, targets) {
      return {
        calories: targets.calories ? dayTotals.calories / targets.calories : 0,
        protein: targets.protein ? dayTotals.protein / targets.protein : 0,
        fiber: targets.fiber ? dayTotals.fiber / targets.fiber : 0,
      };
    },

    /* Project monthly food cost from a daily plan cost. */
    monthlyCost: function (dayCost) {
      return {
        day: dayCost,
        week: dayCost * 7,
        month: dayCost * 30,
      };
    },

    /* Weight trend: simple linear slope (lb/week) over the last N entries. */
    weightTrend: function (weights) {
      if (!weights || weights.length < 2) return null;
      var pts = weights.slice(-8).map(function (w) {
        return { x: Anchor.util.keyToDate(w.date).getTime(), y: w.lb };
      });
      var n = pts.length;
      var sx = 0, sy = 0, sxx = 0, sxy = 0;
      pts.forEach(function (p) {
        sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y;
      });
      var denom = n * sxx - sx * sx;
      if (denom === 0) return null;
      var slopePerMs = (n * sxy - sx * sy) / denom;
      var slopePerWeek = slopePerMs * 7 * 86400000;
      var first = pts[0].y, last = pts[n - 1].y;
      return {
        perWeek: slopePerWeek,
        total: last - first,
        latest: last,
        start: first,
      };
    },

    /* A friendly nudge string for the weight trend vs goal. */
    trendAdvice: function (trend, goal) {
      if (!trend) return "Log a few weights to see your trend.";
      var pw = trend.perWeek;
      if (goal === "gain") {
        if (pw < 0.1) return "Not gaining yet. Add ~200 cal — an extra shake or more olive oil/PB.";
        if (pw > 0.6) return "Gaining fast. Trim ~200 cal if you're feeling soft.";
        return "On track — steady lean gain. Keep going.";
      }
      if (goal === "cut") {
        if (pw > -0.1) return "Not losing yet. Trim ~200 cal or add a walk.";
        if (pw < -1.1) return "Losing fast — add a little back to protect muscle.";
        return "On track. Steady loss.";
      }
      return Math.abs(pw) < 0.2 ? "Holding steady — nice." : "Drifting; nudge calories if you want to hold.";
    },
  };

  Anchor.calc = calc;
})(window.Anchor = window.Anchor || {});
