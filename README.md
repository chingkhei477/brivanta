# Brivanta — website

Static website for **Brivanta** (brivanta.in): plain HTML, CSS and JavaScript with no build step, no database and no admin dashboard.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `offers.html` | Offers (loaded from `data/offers.json`) |
| `how-it-works.html` | How It Works |
| `about.html` | About Brivanta |
| `contact.html` | Contact + form |
| `privacy-policy.html` | Privacy Policy |
| `terms.html` | Terms & Conditions |
| `cashback-policy.html` | Cashback Policy |
| `refund-policy.html` | Refund & Cancellation Policy |
| `404.html` | Not-found page |

## Deploy (GitHub + Vercel)

1. Upload the **contents** of this folder to the root of a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository. Framework preset: **Other**. Leave the build command empty and the output directory as the root.
3. Add the domain `brivanta.in` in **Project → Settings → Domains**.

`vercel.json` adds security headers (Content-Security-Policy, HSTS, X-Frame-Options and others). Vercel serves `404.html` automatically.

## Adding offers

Edit `data/offers.json`. While the `offers` list is empty, the Offers page shows a "No live offers right now" notice. Only add offers that are active with the store.

```json
{
  "updated": "YYYY-MM-DD",
  "offers": [
    {
      "store": "Store name",
      "category": "Fashion",
      "cashback": "Up to 5%",
      "cashbackNote": "on eligible order value",
      "description": "What qualifies, in one or two sentences.",
      "confirmation": "Around 60 days",
      "validTill": "YYYY-MM-DD",
      "terms": ["Website orders only", "Store coupons not allowed"],
      "link": "https://your-affiliate-tracking-link"
    }
  ]
}
```

- `store`, `cashback` and `link` are required. The link must start with `https://`.
- An offer is hidden automatically after its `validTill` date. Leave `validTill` empty if the offer has no end date.
- Categories in the filter are built from the offers.

## Contact form

The form needs no server. It checks the fields, then opens the visitor's email app with a message addressed to support@brivanta.in, ready to send. It handles general questions, cashback claims, missing cashback, withdrawal requests (UPI ID only; bank details are requested by email reply) and privacy or data-deletion requests. Links like `contact.html?topic=claim&store=Name#form` pre-fill the form.

## Editing shared parts

The header and footer are repeated in every HTML file. If you change a menu link, email or address, use find-and-replace across all `.html` files. Also update the JSON-LD block in `index.html`.

## Fonts

Headings use "Brivanta Serif", a renamed Latin subset of Lora (SIL Open Font License). It is self-hosted in `assets/fonts/` and its licence notice is in `assets/fonts/FONT-LICENSE.txt`.
