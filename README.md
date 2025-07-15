# Koherence

A web application for managing your Kobo e-reader library. Upload epubs, automatically convert them to kepub format, and sync them wirelessly to your device.

## Features

- Google OAuth authentication
- Upload and manage epub files
- Automatic conversion to kepub format using kepubify
- Cover image extraction and optimization
- Metadata extraction from epub files
- Wireless sync with Kobo devices (coming soon)
- Clean, modern UI with dark mode support

## Requirements

- Node.js 18 or later
- A Google Cloud project for OAuth authentication
- Internet connection (for initial setup to download kepubify)

## Supported Platforms

The application has been tested on:
- macOS (Intel and Apple Silicon)
- Linux (x64)
- Windows (x64)

Note for Apple Silicon (M1/M2) users: The setup script will automatically download the correct ARM64 version of kepubify.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/koherence.git
cd koherence
```

2. Install dependencies:
```bash
npm install
```

3. Run the setup script:
```bash
npm run setup
```

4. Configure OAuth:
   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable the Google OAuth2 API
   - Create OAuth 2.0 credentials (type: Web application)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Copy your Client ID and Client Secret
   - Update them in your `.env` file

5. Start the development server:
```bash
npm run dev
```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run db:studio` - Open Prisma Studio to manage the database
- `npm run db:push` - Push database schema changes

## Project Structure

```
src/
  ├── app/              # Next.js app router pages and API routes
  ├── components/       # React components
  ├── lib/             # Utility functions and shared code
  └── scripts/         # Setup and maintenance scripts
```

## License

MIT
