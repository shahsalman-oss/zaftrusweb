# Zaftrus assistant — knowledge folder

Drop verification and reference documents in this folder. The "Queries" assistant reads
them automatically the next time the site is deployed. No code changes, no rebuild step.

**Supported:** .pdf  .docx  .md  .txt  .csv  .tsv  .json  .html  .yaml
(subfolders are fine; the file name is shown to the assistant as the document title)

**Ignored on purpose:** this README, any file whose name starts with `_` or `.`
(use `_draft-report.pdf` to keep a file here without the assistant seeing it), images, and other file types.

**Private:** nothing in this folder is publicly downloadable. The site blocks `/knowledge/*`.

## Tips for the best answers
- One document per test or claim, with a clear name: `AEGIS-NEXA-recovery-test-2026-09.pdf`.
- Put conditions next to figures (source water, flow rate, temperature, lab, protocol, date).
  The assistant repeats figures together with their stated conditions.
- If two documents disagree, the assistant treats the newer, more specific verification document
  as authoritative over the website text. Remove superseded files.
- Limits: about 450,000 characters of text and 18 MB of PDFs in total. Extra files are skipped.

## Checking what was loaded
Set an environment variable `ZAFTRUS_ADMIN_KEY` in Netlify (any secret string), then open:
`https://YOUR-SITE/.netlify/functions/queries?key=YOUR_SECRET`
It lists every page and document the assistant can see, and anything that was skipped and why.
