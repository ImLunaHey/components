# Cardlattice test records

`cardlattice.json` contains an unmodified subset of the public CC0 Cardlattice
snapshot at revision `33886561336c8fca7da50788e31746ce319dcfaa` (2026-11-25), including
referenced cards, sets, series and game records. Source:
https://cardlattice-status.pages.dev/data/manifest.json.

These records are used only by tests. The app downloads the current published
snapshot at runtime and never falls back to test fixtures. Test manifests are
computed from these bytes so integrity checks run in browser tests too.

The `tcgdex-en-*.json` files contain a small subset of actual TCGdex API responses
from 2026-11-25. Image fixtures are the matching TCGdex assets, used for offline
image-loading and screenshot tests:

- https://assets.tcgdex.net/en/bw/bw7/20/high.webp
- https://assets.tcgdex.net/en/me/30th/023/high.webp

These images are Pokémon artwork, copyright their respective owners, not CC0.
TCGdex matching and format documentation: https://tcgdex.dev/assets and
https://tcgdex.dev/rest/set.
