# HTML element coverage

Audited against the [MDN HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) on 2026-11-24.

- 114 nonexperimental entries are represented across the gallery, document shell, isolated iframe and template/shadow DOM examples. This inventory includes SVG and MathML roots as listed by MDN.
- `selectedcontent` and `geolocation` are documented as experimental, with inert markup examples. They are not required by the component library.
- Deprecated elements are excluded; the complete excluded list remains in `html-reference.json`.
- Nonvisual metadata and scripting are structural coverage, not visible component cards.
- Select, option and optgroup remain the hidden form model behind custom pickers; datalist suggestions are enhanced into a custom combobox.
- All current input types have examples, including hidden and image-submit inputs. Unsupported date/week/month input types fall back to text according to the browser.

Run `npm test` to verify coverage and duplicate IDs. Examples are in `design/html-elements.html`; typography and control styles are scoped in `design/html-elements.css`. Native audio/video controls retain browser-specific appearance.
