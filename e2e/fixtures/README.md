# Cardlattice test records

`cardlattice.json` contains an unmodified subset of the public CC0 Cardlattice
snapshot at revision `33886561336c8fca7da50788e31746ce319dcfaa` (2026-11-25), including
referenced cards, sets, series and game records. Source:
https://cardlattice-status.pages.dev/data/manifest.json.

These records are used only by tests. The app downloads the current published
snapshot at runtime and never falls back to test fixtures. Test manifests are
computed from these bytes so integrity checks run in browser tests too.
