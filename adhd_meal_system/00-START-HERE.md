# 00 — START HERE (10-minute setup)

Don't read the whole system right now. ADHD brains bounce off big plans. Do these
**5 small things today**, and you have a working system tonight. Everything else is
optional depth you can read later.

---

## ✅ Step 1 — Set 4 alarms (3 minutes)

Open your phone clock app. Create these 4 recurring alarms. Label each one with the
*action*, not the time. The label matters — it tells your brain what to do so you
don't have to decide.

| Alarm | Label (type this exactly) |
|-------|---------------------------|
| ~30 min after your usual wake time | 🍳 EAT NOW (before meds peak) |
| ~12:30 pm | 🥤 DRINK lunch — appetite is gone, that's expected |
| ~3:30 pm | 🥜 Protein snack — head off the crash |
| ~6:30 pm | 🍽️ Dinner — the rebound hits now, feed it on purpose |

> Why labels matter: an alarm that says "12:30" makes you decide what to do. An
> alarm that says "DRINK lunch" *is* the decision. Time-blindness can't argue with it.

Exact times get tuned later in `02-meal-schedule.md`. Approximate is fine to start.

---

## ✅ Step 2 — Run the tool to see today's food (1 minute)

```bash
cd adhd_meal_system
python3 meal_planner.py today
```

It prints your 4 anchor meals for today, already chosen, with a low-energy fallback
for each. **You do not decide what to eat. The tool already did.**

---

## ✅ Step 3 — Stock the "Crash Shelf" (mental note now, buy this week)

Pick **one shelf in your kitchen** and one spot in your fridge. These hold *only*
the emergency foods from `05-crash-protocol.md` — the stuff that requires zero
cooking and zero decisions and is still way better than Taco Bell.

Minimum crash-shelf starter kit (buy on your first grocery run):
- Protein shakes (ready-to-drink, the kind you just open) ×8+
- Greek yogurt cups or cottage cheese cups
- Pre-cooked chicken (rotisserie, grilled strips, or canned)
- Microwave rice/quinoa pouches + a bag of frozen veg
- Fruit that needs no prep (apples, bananas, berries, clementines)
- Protein bars you actually like (this is your candy replacement — see Step 5)

The crash shelf is the whole game. **When executive function is gone, you will eat
whatever is closest and easiest. So make the closest, easiest food the good food.**

---

## ✅ Step 4 — Do one grocery run (this week)

```bash
python3 meal_planner.py groceries
```

It prints a complete, store-section-organized list for the week's rotation. Buy it
once. Now your kitchen is pre-loaded and the system runs on autopilot.

---

## ✅ Step 5 — Set up your 3 junk replacements (the most important step)

Your three failure foods have direct, barely-more-effort upgrades. Buy these so the
craving has somewhere good to go:

| When you crave... | The system's answer (keep these stocked) |
|-------------------|------------------------------------------|
| 🍬 **Candy** | Protein bar + frozen berries, or Greek yogurt + honey + dark chocolate chips |
| 🍕 **Frozen pizza** | High-protein flatbread/tortilla pizza (5 min, see menu) OR a "better frozen" brand with 20g+ protein |
| 🌮 **Taco Bell** | 5-minute burrito bowl: microwave rice + canned beans + pre-cooked chicken + salsa + cheese |

Full breakdown in the **Junk Food Translator** (`03-meal-menu.md`). The point isn't
to *resist* the craving — it's to redirect it to something that scratches the same
itch with 3× the protein and a fraction of the regret.

---

## That's it. You have a system tonight.

When you have energy and curiosity later, read:
- `01-the-system.md` — *why* this works, so you trust it when it's hard.
- `02-meal-schedule.md` — dial in your real times + medication timing.
- `07-prep-system.md` — how 20 minutes on a good day buys you a week of easy meals.

**Do not try to be perfect. The system is designed to survive you doing it badly.**
Missing a meal, eating off-plan, skipping a prep day — none of that breaks it. You
just pick it back up at the next alarm. There is no "starting over."
