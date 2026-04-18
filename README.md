# Suitcase E-Shop

Multi-page e-commerce website built with HTML, SCSS, and TypeScript. The project includes a homepage, catalog, product details page, about page, contact page, and cart page. Product data is loaded from local JSON and the compiled assets are generated into the `dist` directory.

## Requirements

- Node.js and npm installed locally
- Run the project using `npm install` and `npm run dev`

## Setup And Run

1. Install dependencies:

```bash
npm install
```

2. Start the project:

```bash
npm run dev
```

This command compiles TypeScript and SCSS, then starts the local development server.

The project is available at `http://localhost:3002/src/index.html`.

## Build

To compile the project without starting the server, run:

```bash
npm run build
```

This generates compiled files in the `dist` directory.

## Linting

To run ESLint and Stylelint:

```bash
npm run lint
```

## Project Structure

- `src/html` - page templates
- `src/scss` - styles written in SCSS partials
- `src/ts` - TypeScript logic for each page and shared modules
- `src/assets/data.json` - local application data
- `dist` - compiled CSS and JavaScript output
