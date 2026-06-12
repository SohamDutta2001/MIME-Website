# Art-Teas-Tree Café — Owner's Guide to Updating the Website

This guide is for the café owner. No coding knowledge is needed. You only need Google Sheets and a web browser.

---

## How it works

You maintain two tabs in one Google Sheet:
- **Menu** — every item available at the café
- **Events** — upcoming performances, workshops, and exhibitions

When you save the Sheet, the website updates automatically every morning at 7:00 AM. If you need a change live sooner, ask the developer to trigger a manual update (takes about 2 minutes).

---

## Your Google Sheet

👉 **[Open the café spreadsheet](https://docs.google.com/spreadsheets/d/1Vbjc75P7A3dTZGCeNCJfUga-e_qN4hgfjNwuRwmlGAM/edit?usp=sharing)**

If you don't have access, ask the developer to share it with you.

---

## The Menu tab

### What the columns mean

| Column | What to type | Example |
|--------|-------------|---------|
| `id` | A unique number for each row. Just count up: 1, 2, 3… | `7` |
| `category` | The section this item belongs to. Use any name you like — it becomes a filter tab on the website. | `Tea` |
| `itemName` | The name of the item, as it appears on the menu | `Bharer Cha` |
| `price` | The price in rupees — just the number, no ₹ symbol needed | `25` |
| `description` | One or two sentences describing the item. Optional but recommended | `Milky roadside tea, cardamom warmth.` |

### How to add a new menu item

1. Scroll to the bottom of the Menu tab
2. Type a new row with all five columns filled in
3. Give it the next `id` number in sequence
4. Use a `category` that already exists (e.g. `Tea`) — or type a new one to create a new section

### How to remove an item

Simply delete the row. The item disappears from the website on the next update.

### How to change a price or description

Click the cell, edit it, press Enter. Done.

### Important rules for Menu

- **Do not rename the column headers** (row 1). The website reads them by name.
- `category` values are case-sensitive. `Tea` and `tea` are different sections. Pick one and stick to it.
- Items appear on the website in the same order as they appear in the Sheet, top to bottom.

---

## The Events tab

### What the columns mean

| Column | What to type | Required? | Example |
|--------|-------------|-----------|---------|
| `active` | `TRUE` to show on website, `FALSE` to hide | Yes | `TRUE` |
| `category` | Must be exactly one of: `Performance`, `Workshop`, `Exhibition` | Yes | `Performance` |
| `title` | The event name | Yes | `Rabindra Sangeet Evening` |
| `date` | Date in YYYY-MM-DD format | Yes | `2026-08-15` |
| `time` | Time as free text | No | `6:00 PM` |
| `venue` | Location — leave blank to default to the café | No | `Art-Teas-Tree Cafe` |
| `bannerUrl` | A photo URL for the event poster | No | `https://...` |
| `description` | Main description. Leave a blank line between paragraphs | No | See below |
| `additionalInfo` | Extra details: artist bio, what to bring, curator note | No | `Ustad Ratan Das has performed...` |
| `galleryUrls` | Photo links, one per line (use Alt+Enter to add lines in a cell) | No | See below |
| `registrationUrl` | Link to register or sign up. Leave blank for walk-in events | No | `https://forms.google.com/...` |

### How to add a new event

1. Add a new row at the bottom of the Events tab
2. Set `active` to `TRUE`
3. Fill in `category` (exactly `Performance`, `Workshop`, or `Exhibition`)
4. Fill in `title` and `date` (YYYY-MM-DD format — see tip below)
5. Fill in as many optional fields as you have

The event will appear on the homepage notice board and get its own detail page.

### How to hide a past event

Change `active` from `TRUE` to `FALSE`. The event disappears from the website but the row stays in your Sheet (so you have a record of it).

### Tip: entering dates correctly

The date column must be in **YYYY-MM-DD** format (year-month-day). Google Sheets sometimes reformats dates automatically. To prevent this:
1. Select the date column
2. Format → Number → **Plain text**
3. Then type the date as `2026-08-15`

### Tip: multiple gallery photos

To add several photo links in the `galleryUrls` cell:
1. Type the first URL
2. Press **Alt+Enter** (not just Enter) to start a new line inside the same cell
3. Type the second URL
4. Repeat for each photo

### How to add a banner photo

The simplest method: upload the photo to Google Drive, copy the sharing link, paste it into `bannerUrl`. For best results, the photo should be landscape (wider than tall).

If the café has a Cloudinary account set up, paste the Cloudinary URL directly.

### Important rules for Events

- **Do not rename the column headers** (row 1).
- `category` must be spelled exactly: `Performance`, `Workshop`, or `Exhibition` (capital first letter).
- `date` must be `YYYY-MM-DD`. Wrong format = event won't appear. Check the debug page if an event seems missing (see below).
- A row with `active = FALSE` is completely ignored — safe to leave incomplete drafts.

---

## How often does the website update?

- **Automatically:** Every morning at 7:00 AM IST
- **On demand:** Ask the developer to trigger a manual rebuild (ready in ~2 minutes)

---

## Something looks wrong — how to check

If an event or menu item isn't showing up:

1. Open the Sheet and check:
   - For events: Is `active` set to `TRUE`? Is `category` spelled correctly? Is `date` in YYYY-MM-DD format?
   - For menu: Is the row complete (id, category, itemName, price)?
2. Visit the debug page: `https://sohamdutta2001.github.io/MIME-Website/debug/events`
   - This shows exactly what data the website loaded on the last build
   - If your event is missing here, there's a typo in the Sheet
3. If the debug page looks correct but the live site doesn't, a manual rebuild is needed

---

## What the developer needs to set up (one-time)

If you're the developer reading this, complete these steps before handing off:

1. **Create the Google Sheet** with Menu and Events tabs using the column headers above
2. **Share it** as "Anyone with the link can view"
3. **Set GitHub Secrets** in `Settings → Secrets → Actions`:
   - `MENU_SHEET_ID` — the long ID in the Sheet URL between `/d/` and `/edit`
   - `MENU_SHEET_GID` — the `gid=` number in the URL when the Menu tab is selected
   - `EVENTS_SHEET_GID` — the `gid=` number for the Events tab
4. **Trigger a manual build** via GitHub Actions to confirm the sync works
5. **Share the Sheet** directly with the owner's Google account

### Current secrets status
- ✅ `MENU_SHEET_ID` — `1Vbjc75P7A3dTZGCeNCJfUga-e_qN4hgfjNwuRwmlGAM`
- ✅ `MENU_SHEET_GID` — `0` (first tab)
- ⏳ `EVENTS_SHEET_GID` — pending (Events tab must be created in the sheet first)
