# CSS & JS File Structure Reference

## CSS Files

- **css/main.css**
  - Purpose: Main editable stylesheet for everyday site styles.
  - Loaded on: All standard pages (e.g., index.html, Portfolio.html, services.html)
  - Notes: Use for editing; changes are minified to main.min.css for production.

- **css/main.min.css**
  - Purpose: Minified production version of main.css for faster loading.
  - Loaded on: All standard pages.
  - Notes: Do not edit directly; generated from main.css.

- **css/tailwind-input.css**
  - Purpose: Source file for Tailwind CSS utilities/components.
  - Loaded on: Not loaded directly; used to generate tailwind.min.css.
  - Notes: Edit here to add/remove Tailwind classes.

- **css/tailwind.min.css**
  - Purpose: Compiled/minified Tailwind CSS for production.
  - Loaded on: All standard pages.
  - Notes: Do not edit directly; generated from tailwind-input.css.

- **css/visibility-check.css**
  - Purpose: Styles for the Visibility Check tool/page.
  - Loaded on: Only on visibility-check.html.
  - Notes: Kept separate to avoid loading tool styles on other pages.

## JS Files

- **js/main.js**
  - Purpose: Main editable JavaScript for everyday site functionality.
  - Loaded on: All standard pages.
  - Notes: Use for editing; changes are minified to main.min.js for production.

- **js/main.min.js**
  - Purpose: Minified production version of main.js for faster loading.
  - Loaded on: All standard pages.
  - Notes: Do not edit directly; generated from main.js.

- **js/font-loader.js**
  - Purpose: Optimizes font loading to prevent layout shift and improve performance.
  - Loaded on: All standard pages.
  - Notes: Kept separate for flexibility; can be updated independently.

- **js/visibility-check-FIXED.js**
  - Purpose: JavaScript for the Visibility Check tool/page.
  - Loaded on: Only on visibility-check.html.
  - Notes: Kept separate to avoid loading tool scripts on other pages.

## Why Files Are Kept Separate
- **Performance:** Only load what each page needs; tool-specific code/styles are not loaded site-wide.
- **Maintainability:** Easier to edit, debug, and update files without risk of breaking unrelated features.
- **Organization:** Tool-specific files are grouped and only loaded where required.

## Reference: Which Pages Load Which Files
| Page                      | CSS Files Loaded                        | JS Files Loaded                  |
|---------------------------|-----------------------------------------|----------------------------------|
| index.html, Portfolio.html, services.html, etc. | main.min.css, tailwind.min.css         | main.min.js, font-loader.js      |
| visibility-check.html     | main.min.css, tailwind.min.css, visibility-check.css | main.min.js, font-loader.js, visibility-check-FIXED.js |

## Maintenance Notes
- Always edit source files (main.css, main.js, tailwind-input.css) and recompile/minify for production.
- Tool-specific files should remain separate for best performance and organization.
- Refer to this document before making future changes to file structure.

---
