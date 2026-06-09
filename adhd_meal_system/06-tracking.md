# 06 — ADHD-Friendly Tracking (the minimum that helps)

Most tracking advice is a trap for ADHD: detailed food logging is tedious, it's easy to
fall behind, and the day you miss an entry is the day you quit the whole app. So this
system tracks **the least possible** while still moving your body-comp goal.

> **Principle:** track *behaviors you can control*, not *outcomes you can't*. And make
> the track so small it survives a bad week.

---

## Tier 0 — The only thing you truly must do

**Eat at every scheduled meal, and hit your protein.** For a weight-*gain* goal the
failure mode isn't overeating — it's *under*-eating, because your meds erase the hunger
that would normally drive you to the next meal. So Tier 0 is simply: **don't skip
meals, and add a calorie booster (olive oil / peanut butter / shake) when you can.**
The menu lands you near your protein target just by eating the scheduled meals.

---

## Tier 1 — The 10-second daily check (recommended)

At your "kitchen closed" alarm, answer 3 yes/no questions. That's the whole log:

```
[ ] Did I eat at 3+ of my anchor meals today?
[ ] Did I hit roughly my protein + calorie (surplus) target?
[ ] Did I add a calorie booster (olive oil / PB / shake) somewhere?
```

3 checkboxes. No grams, no photos, no app rage. You can do this in your head, on a
sticky note, or the tool can prompt you (`python3 meal_planner.py checkin`).

The win condition is **mostly yes, most days** — not perfection. 5/7 days is a winning
week. This is how consistency compounds without burning out.

---

## Tier 2 — Weekly, not daily (for the weight-gain goal)

Pick **one** weekly metric. Daily weigh-ins are noise and feed the all-or-nothing
spiral; weekly is signal.

- **Body weight:** same morning each week (e.g. Sunday), after bathroom, before eating.
  Track the *trend over weeks*, not any single number. Target a steady **~0.25–0.5 lb
  gain per week** — slow enough that it's mostly lean, not fat.
- **Or a photo / mirror / how-clothes-fit check** if the scale messes with your head.

Adjust calories only every 2–3 weeks based on the *trend*:
- **Not gaining** → add ~200 cal (an extra booster: more olive oil, a bigger shake,
  extra rice). Easiest lever when appetite is low is *liquid* calories.
- **Gaining too fast / feeling soft** → trim ~200 cal.
- (Get target numbers from `python3 meal_planner.py calc`.)

---

## What to deliberately NOT track

- ❌ Every gram of every food, every day. (Burnout machine.)
- ❌ Daily weight. (Noise. Triggers the spiral.)
- ❌ "Clean vs cheat" moralizing. (Fuels all-or-nothing quitting.)
- ❌ Streaks you can "break." (One miss → quit. The system has no streak by design.)

---

## Optional: a "did the system work?" note, not a food diary

If you like data (you might — you built a trading repo), track *the system*, not the
food. Once a week jot:
- Which days hit 3+ anchors?
- Did the crash protocol get used, and did it keep you out of the drive-thru?
- Any meal you're sick of? (→ edit the rotation.)
- Did you run out of any crash-shelf item? (→ buffer it more.)

That turns this into a system you *tune*, which is far more ADHD-sustainable than a diet
you *adhere to*. You're debugging a process, not grading your willpower.
