# The ADHD Meal System

A meal system built for an ADHD brain on a tight budget — not a willpower-based diet.

This is **not** a meal plan you have to remember to follow. It's a system designed
around how ADHD actually works, with one bottleneck above all others:

> **The bottleneck is executive function** — your brain's ability to *initiate,
> decide, sequence, and follow through*. When it's depleted (stress, end of day, meds
> wearing off, boredom, overwhelm), eating doesn't happen, or it happens badly. The
> entire system exists to lower the activation energy of eating so that it still
> happens when your executive function is near zero.

Willpower is the first thing ADHD takes. So nothing here depends on willpower. It
depends on **removing decisions, lowering effort, and attaching eating to things you
already do** — so the easy path and the good path are the same path.

---

## Who this is built for (your profile)

- **Executive function is the constraint.** Breakfast, lunch, *and* dinner are all
  hard. No meal is "the easy one."
- **No reliable hunger cues** (ADHD + appetite-suppressing meds). Eating can't wait for
  hunger — it runs on alarms and routines.
- **You love cooking.** So cooking is the *engine* of this system, not a chore. You
  batch-cook when the spark hits, and coast on leftovers when it doesn't.
- **Goal: lean weight GAIN** → a controlled calorie *surplus*, high protein, adequate
  fiber. This is the hard part: gaining weight while your meds kill your appetite means
  eating on the alarm even when you feel nothing, leaning on **calorie-dense cheap
  foods** (olive oil, peanut butter, oats, whole milk, nuts) and **liquid calories**
  (shakes go down when food won't).
- **Cheapest possible living in Andover, MA.** Low monthly food cost is a hard
  requirement, so every meal is costed and the whole thing is built around cheap,
  nutrient-dense, cook-from-scratch staples.

---

## The two engines

This system runs on two things working together:

1. **Cook-once-eat-many.** You love cooking, so you cook a *big batch* on a
   good-executive-function day. That single act of cooking (the fun part) produces
   days of leftovers (the no-effort part). Leftovers are the cheapest food and the
   lowest-effort food at the same time — perfect for an ADHD brain and a tight budget.
2. **An effort floor under every meal.** Every meal has a no-cook, 2-minute fallback
   for days when even cooking is too much. You never drop below "ate protein." The
   floor is cheap too.

---

## How to use it (start here)

1. **Read `00-START-HERE.md`** — a short setup, not a lifestyle change.
2. **See what to eat today, already decided:**
   ```bash
   python3 meal_planner.py today
   ```
3. **See your monthly food budget and cheapest staples:**
   ```bash
   python3 meal_planner.py budget
   ```
4. **Set the meal alarms** from `02-meal-schedule.md`. This is what beats
   time-blindness. Don't skip it.
5. **Do one cheap grocery run** (`python3 meal_planner.py groceries`) — Market Basket
   strategy is in `08-budget-and-cost.md`.

---

## The files

| File | What it's for |
|------|---------------|
| `00-START-HERE.md` | Short setup. Do this first. |
| `01-the-system.md` | The executive-function strategies this is built on, and *why*. |
| `02-meal-schedule.md` | Anchor-based schedule for when every meal is hard + med timing + alarms. |
| `03-meal-menu.md` | The cook-forward, cheap, decision-free menu. $/serving on everything. |
| `04-grocery-list.md` | The repeatable, budget shopping checklist. |
| `05-crash-protocol.md` | What to eat when executive function is gone — cheap, zero-effort. |
| `06-tracking.md` | The *minimum* tracking that actually helps. |
| `07-prep-system.md` | Batch-cooking system that turns cooking-love into a week of easy meals. |
| `08-budget-and-cost.md` | **The money model.** Cheapest protein/fiber per dollar, Andover store strategy, monthly budget. |
| `meal_planner.py` | Runnable tool: today's plan, budget, groceries, targets, low-effort swaps. |

---

## The one rule

**Eat on the schedule, even when you're not hungry and even when it's "just" the
fallback.** No hunger cue is coming to remind you, so eating is a scheduled task. Some
days that means a cooked meal you're proud of. Some days it means a can of tuna and a
banana. Both count. The system is built to survive you doing it badly — you never
"start over," you just eat at the next alarm.
