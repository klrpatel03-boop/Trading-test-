#!/usr/bin/env python3
"""
Garden tracker web dashboard.

Run:
  cd garden
  pip install -r requirements.txt
  python app.py

Then open http://localhost:5000 in your browser.
"""

from datetime import date

from flask import (
    Flask, render_template, request, redirect, url_for,
    send_from_directory, flash,
)

import garden_core as gc

app = Flask(__name__)
app.secret_key = "garden-local-dev"  # local single-user app; not security-sensitive


@app.route("/")
def index():
    data = gc.dashboard_data()
    return render_template("index.html", **data)


@app.route("/plants")
def plants():
    data = gc.dashboard_data()
    return render_template("plants.html", **data)


@app.route("/plant/<plant_id>")
def plant_detail(plant_id):
    db = gc.load_db()
    plant = gc.get_plant(db, plant_id)
    if not plant:
        flash("Plant not found.")
        return redirect(url_for("plants"))
    weather = gc.get_weather(db["settings"]["latitude"], db["settings"]["longitude"])
    status = gc.watering_status(plant, weather)
    entries = gc.journal_for_plant(db, plant_id)
    return render_template(
        "plant_detail.html",
        plant=plant, status=status, entries=entries,
        sun_options=gc.SUN_OPTIONS, today=date.today().isoformat(),
    )


@app.route("/plant/add", methods=["GET", "POST"])
def add_plant():
    if request.method == "POST":
        f = request.form
        if not f.get("name", "").strip():
            flash("Give the plant a name.")
            return redirect(url_for("add_plant"))
        gc.add_plant(
            name=f.get("name", ""),
            species=f.get("species", ""),
            bed=f.get("bed", ""),
            sun=f.get("sun", gc.SUN_OPTIONS[0]),
            water_interval_days=f.get("water_interval_days", 3) or 3,
            planted_date=f.get("planted_date", ""),
            notes=f.get("notes", ""),
        )
        flash("Plant added.")
        return redirect(url_for("plants"))
    return render_template(
        "add_plant.html", sun_options=gc.SUN_OPTIONS, today=date.today().isoformat()
    )


@app.route("/plant/<plant_id>/edit", methods=["POST"])
def edit_plant(plant_id):
    f = request.form
    gc.update_plant(
        plant_id,
        name=f.get("name"), species=f.get("species"), bed=f.get("bed"),
        sun=f.get("sun"), water_interval_days=f.get("water_interval_days"),
        planted_date=f.get("planted_date"), notes=f.get("notes"),
    )
    flash("Saved.")
    return redirect(url_for("plant_detail", plant_id=plant_id))


@app.route("/plant/<plant_id>/water", methods=["POST"])
def water_plant(plant_id):
    gc.mark_watered(plant_id, when=request.form.get("when") or None)
    flash("Logged watering.")
    nxt = request.form.get("next") or url_for("index")
    return redirect(nxt)


@app.route("/plant/<plant_id>/delete", methods=["POST"])
def remove_plant(plant_id):
    gc.delete_plant(plant_id)
    flash("Plant removed.")
    return redirect(url_for("plants"))


@app.route("/plant/<plant_id>/journal", methods=["POST"])
def add_journal(plant_id):
    photo = gc.save_photo(request.files.get("photo"))
    gc.add_journal_entry(
        plant_id,
        note=request.form.get("note", ""),
        photo_filename=photo,
        entry_date=request.form.get("date") or None,
    )
    flash("Journal entry added.")
    return redirect(url_for("plant_detail", plant_id=plant_id))


@app.route("/journal")
def journal():
    db = gc.load_db()
    entries = gc.recent_journal(db, limit=60)
    names = {p["id"]: p["name"] for p in db["plants"]}
    return render_template("journal.html", entries=entries, names=names)


@app.route("/settings", methods=["GET", "POST"])
def settings():
    db = gc.load_db()
    if request.method == "POST":
        f = request.form
        db["settings"]["place_name"] = f.get("place_name", "My Garden").strip()
        try:
            db["settings"]["latitude"] = float(f.get("latitude"))
            db["settings"]["longitude"] = float(f.get("longitude"))
        except (TypeError, ValueError):
            flash("Latitude/longitude must be numbers.")
            return redirect(url_for("settings"))
        gc.save_db(db)
        gc.get_weather(db["settings"]["latitude"], db["settings"]["longitude"], force=True)
        flash("Settings saved.")
        return redirect(url_for("settings"))
    return render_template("settings.html", settings=db["settings"])


@app.route("/photos/<filename>")
def photo(filename):
    return send_from_directory(gc.PHOTO_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
