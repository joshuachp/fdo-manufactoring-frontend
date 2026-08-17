# AI Instructions for FDO Manufacturing Frontend

You are joining an existing frontend project for FDO (FIDO Device Onboard) manufacturing management.

Project context:

Frontend repository:
https://github.com/joshuachp/fdo-manufactoring-frontend

Backend/server version:
https://github.com/fido-device-onboard/go-fdo-server/tree/v1.0.0

Important backend details:

* API handlers are located in `go-fdo-server/api/handlers`
* There is an `API` folder containing all endpoints
* Start backend with: `./scripts/rv-serve.sh`
* Frontend runs with:

  * `npm install`
  * `npm run dev`
* When running correctly, the bottom-right sidebar should show `Status OK`

Tech stack:

* React
* React Router (already added)
* shadcn/ui for components
* Backend in Go

Goal:
Analyze the frontend and backend, understand the API contracts, and help implement the missing UI and API integration.

Current tasks:

1. Navigation & Layout

* Improve overall layout setup
* Implement Navbar
* Add Breadcrumbs
* Fix and complete sidebar links
* Ensure proper page routing

2. API Models / Types

* Create TypeScript interfaces/types for:

  * API requests
  * API responses
* Derive them from the backend handlers and API definitions
* Organize them cleanly by domain

3. Manufacturing Server Configuration Page
   Implement:

* GET current manufacturing server configuration
* Form to update/set configuration
* Validation
* Proper loading/error states

4. Devices List Page
   Implement:

* Table listing all devices
* Relevant device metadata
* Pagination/search if useful
* API integration

5. Single Device Detail Page
   Implement:

* Detailed device info
* Ownership voucher visualization
* Ownership voucher download functionality

Instructions:

* First inspect project structure and existing routes
* Identify missing components and unfinished pages
* Inspect backend handlers to map endpoints
* Suggest a work breakdown by feature
* Prioritize implementing API types first, then pages
* Follow shadcn/ui patterns and keep components reusable
* Keep code modular and production-ready

Start by:

1. Mapping all backend endpoints relevant to the frontend
2. Generating TypeScript types
3. Proposing folder structure improvements
4. Listing first PR-sized tasks
