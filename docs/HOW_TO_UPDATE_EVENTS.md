# How to update events on the website

*A guide for the café — no coding, no developer. Ten minutes, start to finish.*

You will use two things:

1. **The Events sheet** in Google Sheets — one row per event.
2. **Cloudinary** — where event photos live ([cloudinary.com](https://cloudinary.com), log in with the café account).

The website reads the sheet every time it rebuilds. Whatever the sheet says, the site shows.

---

## Adding a new event

### Step 1 — upload the images to Cloudinary

1. Log in to Cloudinary and open **Media Library**.
2. Open the folder **events/banners** and upload the main poster/photo for the event (one image, landscape works best).
3. Open **events/galleries** and upload any extra photos.
4. For each image: hover it → click the **link icon (Copy URL)**. Keep these URLs handy — you'll paste them into the sheet.

### Step 2 — add a row to the Events sheet

Open the spreadsheet, go to the **Events** tab, and fill a new row:

| Column | What to put there | Example |
|---|---|---|
| **active** | `TRUE` to show it on the site, `FALSE` to hide it | `TRUE` |
| **category** | One of: `Performance`, `Workshop`, `Exhibition` | `Performance` |
| **title** | The event name, as it should appear on the poster | `Rabindra Sangeet Evening` |
| **date** | Year-month-day, with dashes | `2026-07-04` |
| **time** | Written however you like | `6:00 PM` |
| **venue** | Where it happens | `Art-Teas-Tree Cafe` |
| **bannerUrl** | Paste the banner image URL from Cloudinary | `https://res.cloudinary.com/…` |
| **description** | The main text. Leave an empty line between paragraphs | |
| **additionalInfo** | Performance → who is performing. Workshop → what people will learn. Exhibition → the curator's note | |
| **galleryUrls** | Photo URLs, **one per line inside the same cell** (press `Ctrl+Enter` on Windows, `⌘+Enter` on Mac for a new line) | |
| **registrationUrl** | Where people sign up — a Google Form, a WhatsApp link like `https://wa.me/91…`, a ticket page, or Instagram. **Leave empty for walk-in events** | |

### Step 3 — that's it

Save isn't a button in Google Sheets — it saves itself. The website picks the change up the next time it rebuilds and the event appears:

- on the **notice board** on the homepage (if its date hasn't passed),
- on its **own page**, with the right layout for its category,
- in the list at **/events/**.

> **Which category do I pick?**
> **Performance** — music, drama, stand-up, poetry, storytelling.
> **Workshop** — classes and training sessions of any kind.
> **Exhibition** — art, photography, installations, book shows.

---

## Editing an event

Find the row, change the cell, done. Title changes also change the page's web address, so avoid renaming an event after you've shared its link.

## Hiding an event

Set its **active** column to `FALSE`. The event disappears from the whole site but stays in the sheet, so you can bring it back any time. Past events don't need hiding — they move to the "already happened" list by themselves, and their page stays up as a memory with the photos.

## Cancelling vs. deleting

Prefer `active = FALSE` over deleting the row. Deleted rows are gone; hidden rows can come back.

---

## If something looks wrong

| Problem | Check this |
|---|---|
| Event doesn't appear | Is **active** exactly `TRUE`? Is the **date** written `2026-07-04` style? Has the site rebuilt since your edit? |
| Image is broken | Open the URL from the sheet in a new browser tab. If it doesn't show the photo there, re-copy it from Cloudinary. |
| Event shows under "already happened" | Its date is in the past — check the year. |
| The update build failed | The error message names the exact row and column that's wrong — fix that cell. A half-filled draft row can't break anything as long as its **active** is `FALSE`. |

One habit prevents almost every problem: **keep a row's active set to FALSE until the row is finished.**
