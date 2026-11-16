import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="text-7xl font-bold text-accent">404</h1>
        <p className="mt-3 text-muted">This page could not be found.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-12 items-center rounded-2xl bg-accent px-6 font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:bg-accent-hover"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
