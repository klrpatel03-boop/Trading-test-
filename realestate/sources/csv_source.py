"""CSV import source — the guaranteed, always-works path.

A family member opens a Redfin search, clicks "Download All" (bottom of the
results), and feeds the resulting CSV here (via the web upload or this module).
Redfin's CSV columns map cleanly onto our model via the aliases in models.py, so
this needs no site-specific logic and works with zero network access.
"""

import csv
import io
from pathlib import Path
from typing import List, Optional, Union

from .. import config
from .base import DataSource


class CSVSource(DataSource):
    name = "csv"

    def __init__(self, path: Optional[Union[str, Path]] = None, text: Optional[str] = None):
        """Provide either a `path` to a CSV file or raw CSV `text` (from upload).

        Defaults to the bundled sample so the app runs out-of-the-box.
        """
        self.path = Path(path) if path else (None if text else config.SAMPLE_CSV)
        self.text = text

    def is_available(self) -> bool:
        if self.text is not None:
            return True
        return self.path is not None and self.path.exists()

    def _open(self):
        if self.text is not None:
            return io.StringIO(self.text)
        return open(self.path, newline="", encoding="utf-8-sig")

    def fetch_raw(self, market: Optional[str] = None) -> List[dict]:
        if not self.is_available():
            return []
        handle = self._open()
        try:
            reader = csv.DictReader(handle)
            return [dict(row) for row in reader]
        finally:
            handle.close()
