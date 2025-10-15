# COMP 283 Logic Toolkit

An open-source collection of interactive logic tools created for COMP 283. The project bundles a truth table generator, a LaTeX-ready math keyboard, and a draggable set visualizer into one polished web app that you can run locally or deploy to the web.

## Tools at a Glance

### Truth Table Generator
- Compose expressions with friendly shortcuts that auto-convert to logical symbols (→, ∧, ¬, ⊕, ↔, …).
- Drag variables, statements, and table rows to reorder them; hide/show rows to focus on specific cases.
- Copy the table as LaTeX, Markdown, HTML, or doc-friendly text, and export to CSV, Excel, or PDF.
- Built-in validation guards against duplicate/reserved variable names and empty statements.

### Math Keyboard
- Powered by `mathlive` for rich input with full keyboard support and a custom logic keypad.
- Generates live LaTeX with one-click copy presets (plain, Perusall/Canvas `\(...\)`, and Gradescope/Campuswire `$$...$$`).
- Ideal for drafting logic expressions to paste into homework portals or documentation.

### Set Visualizer
- Interactive playgrounds for membership, union, intersection, complements, Cartesian products, and more.
- Drag elements inside Venn-style diagrams to watch explanations update in real time.
- Filter operations by topic (Foundations, Relationships, Operations, Advanced) to focus on a specific concept.

## Tech Stack
- React 19 with `react-router-dom` for routing between tools.
- Tailwind CSS for styling, combined with `lucide-react` icons.
- `@dnd-kit` powers drag-and-drop interactions across tables and diagrams.
- `exceljs`, `jspdf`, and `html2canvas` handle file exports.
- Cloudflare Pages Functions (`functions/api`) integrate with GitHub for in-app issue reporting.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (defaults to http://localhost:3000):
   ```bash
   npm start
   ```
3. Run the production build:
   ```bash
   npm run build
   ```

Node 18+ is recommended to match React 19 and recent tooling.

## Enabling GitHub Issue Reporting
The truth table page includes a “Feature/Issue Reporting” modal that sends issues directly to GitHub using a Cloudflare Pages Function at `functions/api/create-issue.js`. To enable it in your deployment, configure the following environment variables in your Cloudflare project (or equivalent serverless environment):

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_TOKEN` (classic token with `repo` scope)

Without these variables the modal should be hidden or the requests will fail gracefully.

## Project Structure
```
src/
  App.js                # Routes between tools
  NavBar.js             # Shared navigation
  home/                 # Landing page + tool/contributor cards
  truth-table/          # Generator logic, DnD table, exports, helpers
  math-keyboard/        # Mathlive keyboard, LaTeX output, copy helpers
  set-visualizer/       # Interactive set operation playgrounds
functions/
  api/create-issue.js   # Cloudflare Pages Function for GitHub issue creation
```

## Contributing
- File an issue or feature request directly from the app (or via GitHub once the function is wired up).
- For local changes, branch from `main`, make your updates, and open a pull request.
- Please include screenshots or screen captures when changing UI-heavy components.
- Provide a website and LinkedIn so I can add you to the list of contributors on the home page!