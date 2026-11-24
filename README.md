# Palmrise Event Management System 🎟️

A secure, high-performance digital QR invitation and gate access management system built for **Palmrise**.

## Features

- **Guest Portal & Passcode Verification (`/`)**: Attendees can look up their reserved digital ticket with their unique invitation passcode.
- **Guest RSVP Desk (`/rsvp`)**: Interactive RSVP flow where attendees confirm attendance and allocate additional guests (+1s).
- **Digital Ticket Pass & Badge Generator (`/invite/[token]`)**: High-resolution ticket pass with live QR code, gate status, assigned table number, and one-tap badge download.
- **Fast Gate Camera QR Scanner (`/scan`)**: Real-time camera scanner with laser reticle, dual-tone audio chime feedback, and duplicate entry prevention.
- **Organizer Admin Dashboard (`/admin/dashboard`)**:
  - Live check-in statistics and attendee roster.
  - Search and filter by status, table, or group.
  - 30-Table Dynamic Permutation Switcher with audit logging.
  - One-click export to formatted Excel (`.xlsx`) and Word collation (`.docx`).
- **Brand Palette**:
  - **White (Primary)**: `#FFFFFF`
  - **Royal Blue**: `#1D4ED8`
  - **Crimson Red**: `#DC2626`

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB Atlas via Mongoose
- **Icons**: Lucide React
- **Export Engines**: `xlsx`, `docx`
