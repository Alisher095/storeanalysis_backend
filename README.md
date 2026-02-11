# Welcome to Shelf IQ

## Project info
### Project Name: Shelf IQ
### Type: Retail Intelligence Frontend Dashboard

Shelf IQ is a data-driven frontend dashboard for analyzing product performance, shelf space optimization, and store layout effectiveness using interactive visualizations and actionable insights.

## What is this project about?
StoreSense provides actionable insights through:

- Tail Analysis (Core / Average / Tail products)
- Space Elasticity recommendations
- Store Heatmap visualization (visual floor plan)
- Data Import & Reporting
- Authentication module
- Light / Dark mode
- Fully functional UI with realistic mock data

This is a frontend-only prototype, built to closely resemble a production-ready analytics platform.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**
You can work locally using any IDE (VS Code, WebStorm, etc.).

**Prerequisites**
- Node.js
- npm
(Recommended installation via nvm)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
The application will start with hot-reloading and be available on your local development URL.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Open the repository main page.
- Click Code → Codespaces.
- Select New codespace.
- Edit files in the browser-based environment.
- Commit and push changes when done.

## Key Features
- Dashboard
- Tail Analysis
- Space Elasticity
- Store Heatmap
- Data Import
- Settings

## UI & Experience
- Fully responsive (desktop, tablet, mobile)
- Light & Dark mode toggle
- Unique and modern color palette
- Clean layout with smooth interactions
- User-friendly navigation and feedback states

## What technologies are used for this project?
This project is built with:
- React
- Vite
- Tailwind CSS
- shadcn/ui
- Charting libraries for rich data visualization

## How can I deploy this project?

This project can be deployed on any frontend hosting platform that supports Vite builds, such as:

- Vercel
- Netlify
- Cloudflare Pages

## Notes

- This is a frontend-only prototype using realistic mock data.
- All buttons, filters, and interactions are fully functional.
- The project is structured for easy backend integration in the future.

Feature 1: Tail Analysis (Which products are taking space but not contributing to sales?)
Show in a table:SKUCategorySales %Tail / Core flagSummary:% of SKUs contributing only X% of salesSimple chart:Core vs Tail contributionFeature 2: Space Elasticity (How much shelf space should each category get?)
Show is table:CategorySales %Recommended space (meters)Bar chart:Current vs Recommended spaceFeature 3: Heatmap (Are we placing categories in the right traffic zones?)
Assign traffic based on categoryGenerates simulated heatmapRed = Low performance / Low trafficOrange = Avg performance / Mid level trafficBlue = High performance / High traffic