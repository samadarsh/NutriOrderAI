# NutriOrder AI Production Frontend

This directory is a placeholder for the multi-user production-grade Next.js React application.

## 🚀 Future Setup Instructions

When ready to initialize the Next.js stack, run the following setup steps:

1. **Initialize Next.js App**:
   ```bash
   npx create-next-app@latest ./ --typescript --tailwind --eslint --src-dir=false --app
   ```
2. **Install UI Component Library (shadcn/ui)**:
   ```bash
   npx shadcn-ui@latest init
   ```
3. **Configure API proxying**:
   Configure Next.js rewrites in `next.config.js` to proxy backend requests to the FastAPI microservice running on port `8000`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: 'http://localhost:8000/:path*',
         },
       ]
     },
   }
   module.exports = nextConfig
   ```

## 📂 Current Layout Stub

* **[app/page.tsx](file:///Users/samadarsh/Documents/MY%20PROJECTS/nutriorderai/frontend/app/page.tsx)**: Draft layout showing component boundaries (OAuth integration, address selectors, cart reviews, and order tracking console).
