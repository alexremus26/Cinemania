# Cinemania

Cinemania is now structured as a Node.js + Express application with EJS templates.

## Run

1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm start
```

3. Open in browser:

```text
http://localhost:8080
```

## Project Structure

- `index.js` - Express server entrypoint
- `views/pagini/index.ejs` - main homepage template
- `views/fragmente/head.ejs` - reusable head section
- `views/fragmente/header.ejs` - reusable header/navigation section
- `views/fragmente/footer.ejs` - reusable footer section
- `resurse/` - static assets served by Express

## Static Assets

Express serves static files from `resurse` using server-style absolute paths:

- `/resurse/stiluri/...` for CSS
- `/resurse/imagini/...` for images and favicons
- `/resurse/documente/...` for PDF and downloadable files

All resource references in EJS pages should use absolute URLs (for example `/resurse/stiluri/general.css`) and not relative paths.
