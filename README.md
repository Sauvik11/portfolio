# Automation Portfolio

This is the first editable static version of the automation portfolio.

## Edit the site

- `index.html` contains the page structure and wording.
- `styles.css` contains all visual styling and responsive behavior.
- `script.js` contains the contact-form behavior.

Before publishing, replace:

- `YOUR NAME`
- `your@email.com`
- The placeholder project examples
- The WhatsApp link, once your number is confirmed

## Preview locally

From this folder, run any local static server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

Recommended path: push this folder to a GitHub repository, connect the repository to Cloudflare Pages, and add a custom domain later.

## Deploy changes

Cloudflare Pages is connected to the GitHub repository. After the first setup, deploy updates with:

```powershell
./deploy.ps1 -Message "Describe the change"
```

The script stages the portfolio files, creates a commit, and pushes to `main`. A GitHub push triggers a new Cloudflare Pages deployment automatically.

## Inquiry database setup

The form posts to `/api/inquiries`, which is implemented as a Cloudflare Pages Function. In Cloudflare, create a D1 database, run `schema.sql`, and bind it to the Pages project with the binding name `DB`. The function will then save each enquiry with its selected pathway, name, phone number, requirement, and timestamp.
