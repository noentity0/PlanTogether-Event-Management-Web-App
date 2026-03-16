import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="glass-panel rounded-[2rem] p-10 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-accent-light">404</p>
      <h1 className="mt-4 text-4xl font-bold text-white">That page drifted off the schedule</h1>
      <p className="mt-4 text-sm leading-6 text-textmuted">
        Head back to the home page or jump into the event feed to keep exploring.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="button-primary">
          Home
        </Link>
        <Link to="/explore" className="button-secondary">
          Explore
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
