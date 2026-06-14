# Yaorganize

A cute, clean app to log and organize your stuff by room, container, and item — with photos, tags, stars, search, and easy item moves. Data is stored in MongoDB.

## Features

- **Rooms** — Kitchen, bedroom, office, car, etc.
- **Nested containers** — Closet 1 → Drawer 2 → Shelf A (unlimited depth)
- **Items** — Name, notes, tags, star favorites, photos
- **Photos** — Attach images to rooms, containers, and items
- **Search** — Find anything by name, tag, or location
- **Move items** — Relocate an item to any other place in one tap

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally or [MongoDB Atlas](https://www.mongodb.com/atlas)

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure MongoDB**

Copy the example env file and set your connection string:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/yaorganize
```

For MongoDB Atlas, use your Atlas connection string instead.

3. **Start MongoDB** (if running locally)

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name yaorganize-mongo mongo:7
```

4. **Run the app**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to use

1. **Add a room** — Tap "Add room" and pick Kitchen, Bedroom, etc.
2. **Add containers** — Inside a room, add Closet 1, Drawer 2, etc. You can nest as deep as you want.
3. **Log items** — Add things like "Old phone" with tags (`electronics`, `backup`) and star important ones.
4. **Take photos** — Use the camera button on any place or item.
5. **Search** — Use the search bar to find items or jump to a location.
6. **Move items** — Open an item → tap **Move** → pick a new location.

## Tech stack

- **Next.js 15** (App Router)
- **MongoDB** + Mongoose
- **Tailwind CSS**
- **Lucide icons**

## Project structure

```
src/
  app/
    api/          # REST API routes
    place/[id]/   # Place detail page
    page.tsx      # Home (rooms list)
  components/     # UI components
  models/         # Mongoose schemas
  lib/            # DB connection & helpers
public/uploads/   # Uploaded images
```

## Production

```bash
npm run build
npm start
```

For production, consider using cloud storage (S3, Cloudinary) instead of local `public/uploads/`.
