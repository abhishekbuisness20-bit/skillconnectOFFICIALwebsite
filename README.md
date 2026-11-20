# SkillConnect Official Website

> **Discover Skills. Connect Opportunities.**  
> Official web portal for SkillConnect, founded and developed by **Abhishek Singh**.  
> Scheduled Launch Date: **6 November 2026**  
> Tagline: *Building Skills. Connecting Opportunities.*

---

## 🚀 Overview

SkillConnect is a digital platform designed to bring skills, people, and opportunities closer together. This repository contains the complete, production-ready source code for the official SkillConnect website.

### Key Highlights
- **Ultra-Premium Glassmorphism Design**: Deep navy and obsidian background, neon cyan and electric purple gradients, frosted glass cards (`backdrop-blur-xl`), and smooth responsive layouts.
- **Original Brand Logo Preserved**: The official uploaded SkillConnect logo is preserved without alteration across the navigation bar, hero section, mobile mockups, footer, and favicon.
- **10 Core Pages & Sections**:
  1. `Home` - Cinematic hero, tagline, live countdown to 6 November 2026, and overview.
  2. `About Us` - Vision of Founder & Developer Abhishek Singh and architectural philosophy.
  3. `Features` - Verified feature matrix categorized by status (Core Architecture, Launch 6 Nov 2026, In Development).
  4. `App Showcase` - Realistic mobile device mockups showcasing feed, profile, chat, and opportunities (with explicit "Coming Soon" notice; no fake download links).
  5. `Launch Information` - Complete release roadmap and milestone schedule.
  6. `Contact Us` - Validated inquiry form with direct mailto dispatch and copy-to-clipboard backup.
  7. `Privacy Policy` - GDPR & Indian DPDP compliant data protection terms.
  8. `Terms & Conditions` - Acceptable usage and platform guidelines.
  9. `Disclaimer` - Clear transparency disclosures regarding independent collaboration.
  10. `Account Deletion` - Google Play Store & privacy compliant account removal protocol and timeline (14–30 days).

---

## 🛠️ Tech Stack & Architecture

- **React 19** + **TypeScript**
- **Vite** (configured with relative `base: './'` for 100% GitHub Pages compatibility)
- **Tailwind CSS v4** with custom Glassmorphism tokens
- **Lucide React** icons
- **Zero Server Overhead**: Static-site-ready architecture with client-side hash routing (`#home`, `#about`, `#features`, `#showcase`, `#launch`, `#contact`, `#privacy`, `#terms`, `#disclaimer`, `#deletion`).

---

## 📦 How to Export and Host on GitHub Pages

This project is built to deploy effortlessly to GitHub Pages with zero 404 errors.

### Method 1: Build & Deploy using `gh-pages`

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the production static bundle**:
   ```bash
   npm run build
   ```
   *The optimized static assets will be output to the `/dist` directory.*

3. **Deploy to GitHub Pages**:
   ```bash
   npx gh-pages -d dist
   ```

4. In your GitHub repository:
   - Navigate to **Settings** > **Pages**
   - Under **Build and deployment**, ensure the source is set to **Deploy from a branch** (`gh-pages` branch, `/root` folder).
   - Your site will be live at `https://<your-username>.github.io/<repo-name>/`!

### Method 2: GitHub Actions Automated CI/CD

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy SkillConnect to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build static site
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 👤 Founder & Leadership

- **Founder & Lead Developer**: Abhishek Singh
- **Official Contact**: `singhabhishek83072@gmail.com`
- **Official Domain**: `skillconnect.app`
