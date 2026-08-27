# Action Plan Planner

Action Plan Planner replaces the repetitive AP27 action-plan spreadsheet workflow with a shared planning workspace. It preserves the familiar **20-column `Data` sheet**, keeps the `Key` sheet populated from the administrator-managed brands and activity types, shows live country/brand remaining-budget figures, creates weighted brand allocations for shared activities, and exports an AP27-compatible workbook.

## What is implemented

| Area | Behaviour |
| --- | --- |
| Authentication and roles | Google sign-in through Firebase Authentication. The first authenticated user becomes the owner; later users start as editors. The owner may promote editors to administrators or downgrade them to viewers. |
| Administration | Administrators can add countries and currencies, add brands, add activity types, set individual budgets, or upload a CSV/XLSX budget table with `Country`, `Brand`, and `Budget` columns. |
| Action plan | The online `Data` table keeps the AP27 column order. Direct entries calculate `Total Cost = Number × Cost / Item` and show brand balance tiles for the selected country. |
| Shared activities | One parent activity is split into multiple linked plan lines. The form requires at least two brands and a combined brand weight of exactly 100%; every allocation deducts the correctly weighted amount from that brand’s country budget. |
| Dashboard | Country overview, brand budget ledger, live budget remaining, plan-line count, and activity-spend mix use only entered workspace data. |
| Excel export | Export starts from the AP27 workbook template, retains its `Data` and `Key` worksheets, column widths, 20-column order, formatting pattern, AutoFilter, `SUBTOTAL` in `L1`, and fills updated Key lists plus Brand/Activity dropdown validation. |

## Firebase setup

Create a Firebase project and register a **web app**. Copy the supplied Firebase web configuration values into the six `VITE_FIREBASE_*` repository secrets listed in `firebase-configuration.example.txt`. Enable **Google** under Authentication → Sign-in method, then create a Firestore database. Firebase’s current web guidance recommends the modular JavaScript SDK used in this project, while Firestore supports a direct web-SDK architecture secured through Authentication and Firestore Security Rules. [1] [2]

Deploy `firestore.rules` from the Firebase console’s Firestore Rules editor, or with the Firebase CLI after reviewing it. The rules limit reads to signed-in members, reserve master-data and budget management for owners/admins, let owners manage user roles, and allow owners/admins/editors to maintain action-plan activities. Firestore test mode is intentionally not an acceptable production configuration because it permits unauthenticated data access. [2]

Before users sign in from the published site, add the GitHub Pages domain (`<account>.github.io`) under Firebase Authentication → Settings → Authorized domains. Google authentication must also be enabled in the Firebase console. [3]

## GitHub Pages setup

The included GitHub Actions workflow builds and deploys from `main`. In the GitHub repository, open **Settings → Pages**, choose **GitHub Actions** as the build source, and add the repository secrets referenced in `.github/workflows/deploy.yml`.

| GitHub setting | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web app `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web app `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web app `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Firebase web app `appId` |
| `VITE_BASE_PATH` (optional Repository Variable) | `/` for a custom domain or `<account>.github.io` root repository; `/repository-name/` for a project Pages site. |
| `VITE_AP27_TEMPLATE_URL` (Repository Variable) | A CORS-accessible URL for the original AP27.xlsx. Host the pristine file in a controlled static location such as a Firebase Storage download URL or the organisation’s approved file CDN. |

`VITE_AP27_TEMPLATE_URL` is essential for an exact-format export: the application loads the original workbook as its export base, instead of rebuilding a simplified spreadsheet. Confirm that the URL can be fetched by browsers at the GitHub Pages origin and configure CORS on the storage location if required.

Vite requires the correct `base` value when a site is deployed beneath a repository path, and GitHub Pages should be configured to deploy the built artifact with a GitHub Actions workflow. [4]

## Data collections

All records sit beneath one shared Firestore workspace: `workspaces/default`. Its subcollections are `members`, `brands`, `activityTypes`, `countries`, `budgets`, and `activities`. Every shared allocation is stored as one real, exportable `activities` record per brand with a common `sharedGroupId`, individual `sharedWeight`, and calculated `totalCost`.

## Local development

```bash
# Create a local .env.local using firebase-configuration.example.txt as the key reference.
# Fill the VITE_FIREBASE values and the AP27 template URL.
pnpm install
pnpm dev
```

Without Firebase configuration, the application deliberately opens in **local preview mode** so the interface can be evaluated. Local preview data is browser-only and is not a multi-user substitute.

## References

[1] [Firebase: Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup)

[2] [Firebase: Get started with Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart)

[3] [Firebase: Authenticate Using Google with JavaScript](https://firebase.google.com/docs/auth/web/google-signin)

[4] [Vite: Deploying a Static Site — GitHub Pages](https://vite.dev/guide/static-deploy)
