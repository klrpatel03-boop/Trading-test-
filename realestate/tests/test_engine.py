"""Unit tests for normalization, inference, scoring, and filtering.

Run with:  python -m unittest discover -s realestate/tests
(no third-party test deps required)
"""

import unittest

from realestate import config, engine
from realestate.models import (
    Listing,
    extract_ceiling_note,
    extract_kitchen_note,
    from_raw,
    infer_single_story,
    normalize_lot_to_acres,
)


class TestLotNormalization(unittest.TestCase):
    def test_sqft_converted_to_acres(self):
        # 21780 sqft = exactly 0.5 acre
        self.assertAlmostEqual(normalize_lot_to_acres("21780"), 0.5, places=3)

    def test_acres_passthrough(self):
        self.assertAlmostEqual(normalize_lot_to_acres("0.62"), 0.62, places=3)

    def test_messy_and_missing(self):
        self.assertEqual(normalize_lot_to_acres("—"), None)
        self.assertEqual(normalize_lot_to_acres(""), None)
        self.assertAlmostEqual(normalize_lot_to_acres("24,000"), 24000 / 43560, places=3)


class TestSingleStory(unittest.TestCase):
    def test_ranch_is_single(self):
        self.assertEqual(infer_single_story(None, "Ranch"), (True, False))

    def test_colonial_is_multi(self):
        self.assertEqual(infer_single_story(None, "Colonial"), (False, False))

    def test_stories_field_wins(self):
        self.assertEqual(infer_single_story(1, "Colonial"), (True, False))
        self.assertEqual(infer_single_story(2, "Ranch"), (False, False))

    def test_unknown_is_flagged(self):
        self.assertEqual(infer_single_story(None, "Single Family Residential"), (None, True))


class TestCeiling(unittest.TestCase):
    def test_mentioned(self):
        note, status = extract_ceiling_note("Open layout with 9 ft ceilings and a new roof.")
        self.assertEqual(status, "mentioned")
        self.assertIn("ceil", note.lower())

    def test_spelled_out(self):
        _, status = extract_ceiling_note("Single-level living with nine foot ceilings.")
        self.assertEqual(status, "mentioned")

    def test_absent(self):
        note, status = extract_ceiling_note("Lovely home near schools.")
        self.assertEqual(status, "needs_checking")
        self.assertIsNone(note)

    def test_empty(self):
        self.assertEqual(extract_ceiling_note(None), (None, "needs_checking"))


class TestKitchen(unittest.TestCase):
    def test_gourmet(self):
        note, status = extract_kitchen_note("Gourmet eat-in kitchen with an oversized island.")
        self.assertEqual(status, "spacious")
        self.assertIn("kitchen", note.lower())

    def test_chefs_spacious(self):
        _, status = extract_kitchen_note("Spacious chef's kitchen opens to the dining area.")
        self.assertEqual(status, "spacious")

    def test_island(self):
        _, status = extract_kitchen_note("Updated kitchen with a large center island.")
        self.assertEqual(status, "spacious")

    def test_plain_kitchen_not_flagged_big(self):
        # a mere "kitchen" mention without a size signal should not count as big
        _, status = extract_kitchen_note("Updated kitchen and baths.")
        self.assertEqual(status, "needs_checking")

    def test_absent(self):
        self.assertEqual(extract_kitchen_note("Lovely home near schools."),
                         (None, "needs_checking"))


class TestKitchenSort(unittest.TestCase):
    def _mk(self, addr, score_year, kitchen):
        l = Listing(listing_id=addr, source="t", address=addr,
                    lot_size_acres=0.6, year_built=score_year, is_single_story=True)
        l.kitchen_status = kitchen
        return l

    def test_prefer_big_kitchen_floats_to_top(self):
        # a lower-scoring home with a big kitchen should outrank a higher-scoring
        # home without one when prefer_big_kitchen is on
        high_no_kitchen = self._mk("A", config.CURRENT_YEAR, "needs_checking")
        low_big_kitchen = self._mk("B", config.MIN_YEAR_BUILT, "spacious")
        out = engine.process([high_no_kitchen, low_big_kitchen], prefer_big_kitchen=True)
        self.assertEqual(out[0].address, "B")
        out2 = engine.process([high_no_kitchen, low_big_kitchen], prefer_big_kitchen=False)
        self.assertEqual(out2[0].address, "A")


class TestScoring(unittest.TestCase):
    def _make(self, **kw):
        base = dict(year_built=config.CURRENT_YEAR, lot_size_acres=0.5, sqft=1800,
                    is_single_story=True)
        base.update(kw)
        return Listing(listing_id="t", source="test", **base)

    def test_brand_new_single_story_small(self):
        # 40 (single) + 30 (this year) + 15 (0.5 ac) + 15 (<=2000 sqft) = 100
        self.assertEqual(engine.score_manageability(self._make()), 100)

    def test_oldest_in_window_scores_lower_on_age(self):
        l = self._make(year_built=config.MIN_YEAR_BUILT)  # 0 age points
        # 40 + 0 + 15 + 15 = 70
        self.assertEqual(engine.score_manageability(l), 70)

    def test_multi_story_loses_40(self):
        l = self._make(is_single_story=False)
        self.assertEqual(engine.score_manageability(l), 60)

    def test_unknown_story_partial_credit(self):
        l = self._make(is_single_story=None)
        self.assertEqual(engine.score_manageability(l), 80)

    def test_larger_lot_scores_less(self):
        small = engine.score_manageability(self._make(lot_size_acres=0.5))
        large = engine.score_manageability(self._make(lot_size_acres=0.7))
        self.assertGreater(small, large)


class TestFilters(unittest.TestCase):
    def _l(self, **kw):
        base = dict(lot_size_acres=0.6, year_built=2018, is_single_story=True)
        base.update(kw)
        return Listing(listing_id="t", source="test", **base)

    def test_passes(self):
        self.assertTrue(engine.passes_filters(self._l()))

    def test_lot_out_of_range(self):
        self.assertFalse(engine.passes_filters(self._l(lot_size_acres=1.2)))
        self.assertFalse(engine.passes_filters(self._l(lot_size_acres=0.3)))

    def test_too_old(self):
        self.assertFalse(engine.passes_filters(self._l(year_built=1990)))

    def test_missing_lot_excluded(self):
        self.assertFalse(engine.passes_filters(self._l(lot_size_acres=None)))

    def test_confirmed_multi_story_excluded(self):
        self.assertFalse(engine.passes_filters(self._l(is_single_story=False)))

    def test_unknown_story_kept(self):
        self.assertTrue(engine.passes_filters(self._l(is_single_story=None)))


class TestFromRawRedfinShape(unittest.TestCase):
    def test_redfin_csv_row(self):
        raw = {
            "PROPERTY TYPE": "Ranch",
            "ADDRESS": "9 Elm St",
            "CITY": "Bedford",
            "STATE OR PROVINCE": "NH",
            "ZIP OR POSTAL CODE": "03110",
            "PRICE": "699000",
            "SQUARE FEET": "1500",
            "LOT SIZE": "21780",
            "YEAR BUILT": "2008",
            "DESCRIPTION": "Single-level living with nine foot ceilings.",
            "URL": "https://redfin.com/x",
        }
        l = from_raw(raw, "csv")
        self.assertEqual(l.state, "NH")
        self.assertAlmostEqual(l.lot_size_acres, 0.5, places=3)
        self.assertEqual(l.year_built, 2008)
        self.assertTrue(l.is_single_story)
        self.assertEqual(l.ceiling_status, "mentioned")


if __name__ == "__main__":
    unittest.main()
