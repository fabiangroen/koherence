# Koherence

Koherence is a web application for managing and synchronizing your e-book collection across multiple devices. It allows you to upload your books, view your library, and keep your reading progress in sync.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
- [Database](#database)
  - [Schema](#schema)
  - [Migrations](#migrations)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later)
- npm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/koherence.git
    cd koherence
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:

    ```bash
    cp EXAMPLE.env.local .env.local
    ```

    Update the `.env.local` file with your database credentials and Google OAuth credentials.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `DATABASE`: The connection string for your database.
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode with Turbopack.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the code using Next.js's built-in ESLint configuration.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.

## Database

### Schema

The database schema is defined in `src/db/schema.ts` and includes the following tables:

- `books`: Stores information about the e-books.
- `devices`: Stores information about user devices.
- `device_access`: Manages which users have access to which devices.
- `book_device_sync`: Tracks the synchronization status of books across devices.
- `users`: Stores user information.
- `sessions`: Stores user sessions for authentication.
- `accounts`: Stores provider accounts for users.

### Migrations

Database migrations are handled by Drizzle Kit. To create a new migration, run:

```bash
npm run drizzle-kit generate
```

To apply migrations, run:

```bash
npm run drizzle-kit migrate
```

## Authentication

Authentication is handled by NextAuth.js, with Google configured as the OAuth provider. The configuration can be found in `src/auth.ts`.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](httpshttps://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
