# Improvements & Roadmap

Follow-ups from the completed tasks (CSV country codes, email verification, and the new phone number, years at company and LinkedIn fields), plus a wider review of the codebase. Each item states the problem, the proposal, and a rough priority and size. Items keep their numbers for reference; the table is ordered by priority.

| # | Item | Area | Priority | Size |
|---|------|------|----------|------|
| 1 | Start email verification in the background and cap concurrency | Email verification | High | M |
| 2 | Share lead field definitions and validation between frontend and backend | Architecture | High | M |
| 3 | Confirm "years in role" vs "years at company" with product | Lead fields | High | S |
| 9 | Tighten data integrity on import and listing | Data quality | High | M |
| 11 | Fix repo hygiene, tests and CI | Quality | High | M |
| 4 | Store a company start date instead of a years count | Lead fields | Medium | S |
| 5 | Clean up existing non-ISO country codes | Data quality | Medium | S |
| 8 | Split up the backend and validate requests consistently | Architecture | Medium | M |
| 10 | Run Temporal as proper infrastructure | Infrastructure | Medium | S |
| 12 | Restrict CORS to the frontend's origin | Security | Medium | XS |
| 6 | Show "<1" for less than a year at the company | Leads table | Low | XS |
| 7 | Country picker and flag display | Leads UX | Low | S |

---

## 1. Start email verification in the background and cap concurrency

**Problem:** Verification now runs every selected lead's workflow in parallel, with no limit. Selecting hundreds of leads starts hundreds of workflows at once and would hit the email provider all at the same time. The HTTP request also stays open until every workflow finishes. A slow lead now fails after about 18s instead of hanging, but a large batch still keeps the request waiting.

**Proposal:**
- Start the workflows and return immediately, instead of waiting for results in the request.
- Save a verification status on each lead (pending, verified, invalid, failed). The UI polls for it or receives updates.
- Cap how many verifications run at once, using the worker's activity concurrency or rate-limit settings rather than limiting it in the API.
- Use one workflow ID per lead, so the same lead can't be verified twice at the same time.

## 2. Share lead field definitions and validation between frontend and backend

**Problem:** Several pieces of logic exist in two copies:
- Import validation (country codes, phone, years, LinkedIn) runs on both frontend and backend, but the code is duplicated (`countryCodes.ts`, `leadValidation.ts`).
- The frontend and backend each have their own list of template fields (`leadFields.ts`, `messageGenerator.ts`), and nothing checks they match. If a field is added to one but not the other, generating a message fails with "Unknown field in template".

**Proposal:**
- Move lead field definitions and validation into a shared package used by both apps, so a new field is added in one place.
- Or, as a smaller step, add a backend endpoint that lists the template fields, and build the composer from it.

## 3. Confirm "years in role" vs "years at company" with product

**Problem:** The task asks for "years at current company", but the sample CSVs have a `yearsInRole` column. These measure different things. Import currently accepts both headers and stores the value as `yearsAtCompany`.

**Proposal:** Confirm with product which data point is wanted, and whether we need both. If they differ, add a separate field and stop treating `yearsInRole` as an alias.

## 4. Store a company start date instead of a years count

**Problem:** `yearsAtCompany` is stored as a fixed number, so it goes out of date every year after import.

**Proposal:** Store the date the lead started at the company and work out the years when displaying it or generating a message. CSV imports that only provide a number can be converted to an approximate start date at import time.

## 5. Clean up existing non-ISO country codes

**Problem:** New imports only accept valid ISO 3166-1 alpha-2 codes, but existing data wasn't touched. One lead is stored as `UK`, which isn't a valid code (the ISO code is `GB`).

**Proposal:** Run a one-off data migration that maps known aliases (`UK` → `GB`) and clears or flags codes that can't be fixed.

## 6. Show "<1" for less than a year at the company

**Problem:** A lead who joined less than a year ago shows `0` years in the leads table, which reads like missing or wrong data.

**Proposal:** Show `<1` in the table when the value is 0. Message templates keep the raw value. This becomes part of item 4 if we switch to start dates.

## 7. Country picker and flag display

**Problem:** Country codes are shown as raw two-letter text and can only be set through CSV import.

**Proposal:** Show the country name (and optionally a flag) in the table. Add a searchable country picker wherever leads are edited. Not needed for the bug fix, so low priority.

## 8. Split up the backend and validate requests consistently

**Problem:**
- Every route, plus the Temporal client setup, lives in one `backend/src/index.ts`, so each new endpoint makes it harder to read and test.
- Request bodies are checked by hand in each route. Checks are inconsistent and loosely typed (`any`).
- Endpoints disagree on field names: `POST /leads` expects `name` rather than `firstName`, and `PATCH /leads/:id` can only update name and email.

**Proposal:**
- Split the backend into route, service and data-access modules.
- Validate every request body with one schema library (e.g. zod), and use the same schemas for the response types.
- Make the create and update endpoints use the same field names as the lead model and support all editable fields.

## 9. Tighten data integrity on import and listing

**Problem:**
- Duplicate leads are detected by first and last name, so two different people with the same name are treated as one. Meanwhile the same email can be imported twice under different names.
- Nothing in the database prevents duplicates; the check only exists in application code.
- Bulk import inserts leads one at a time without a transaction, so a failure part-way through leaves a partial import.
- `GET /leads` returns every lead with no pagination, which won't scale as the list grows.

**Proposal:**
- Treat email as the duplicate key, and add a unique constraint on it in the database.
- Insert imported leads in batches inside a transaction, and report which rows were skipped and why.
- Add cursor-based pagination to `GET /leads`, with matching infinite scroll or paging in the table.

## 10. Run Temporal as proper infrastructure

**Problem:**
- The API opens a new Temporal connection on every verification request instead of reusing one.
- The Temporal worker runs inside the API process, so a spike in workflow activity slows the API down, and neither can be scaled on its own.
- The Temporal server address (`localhost:7233`), namespace and task queue name (`myQueue`) are hard-coded.

**Proposal:**
- Create one Temporal client when the API starts and reuse it.
- Run the worker as its own process (a separate `pnpm worker` script and deployment).
- Move connection settings and task queue names into environment config, and give task queues descriptive names (e.g. `email-verification`).

## 11. Fix repo hygiene, tests and CI

**Problem:**
- The local SQLite database (`backend/prisma/dev.db`) is committed to git, so every local change to it shows up as a modification and can be committed by mistake.
- The frontend ESLint config uses the old `.eslintrc.cjs` format, which the installed ESLint version doesn't read, so linting doesn't run.
- Tests only cover utility functions (CSV parsing, validation, message generation). There are no tests for API endpoints, Temporal workflows or React components.
- There's no CI, so type errors and failing tests are only caught if someone runs them locally. A type error in `useApiMutation.ts` went unnoticed until this task.

**Proposal:**
- Remove `dev.db` from git, add it to `.gitignore`, and seed local data from a script instead.
- Migrate to ESLint's flat config (`eslint.config.js`).
- Add endpoint tests against a test database, workflow tests with Temporal's test environment, and component tests for the import and composer modals.
- Add a CI pipeline that runs type checks, lint and tests for both apps on every pull request.

## 12. Restrict CORS to the frontend's origin

**Problem:**
- CORS allows any origin (`Access-Control-Allow-Origin: *`).

**Proposal:**
- Restrict CORS to the frontend's origin, set from environment config.

---

## Roadmap

**Now:** get product's answer, remove the risk of large batches, and add safety nets
- #3 Confirm years in role vs years at company
- #1 Start email verification in the background and cap concurrency
- #9 Tighten data integrity on import and listing
- #11 Fix repo hygiene, tests and CI

**Next:** reduce duplication, data drift and infrastructure debt
- #2 Shared field definitions and validation
- #8 Split up the backend and validate requests consistently
- #10 Run Temporal as proper infrastructure
- #12 Restrict CORS to the frontend's origin
- #4 Company start date instead of a years count
- #5 Country code data migration

**Later:** UX polish
- #6 "<1" years display
- #7 Country picker and flag display
