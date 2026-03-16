import { useEffect } from "react";
import { Link } from "react-router-dom";

import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { events, eventsLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents({ search: "", category: "All" });
  }, []);

  return (
    <div className="space-y-10">
      <section className="glass-panel overflow-hidden rounded-[2.5rem] p-8 sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.38em] text-accent-light">Modern Event Management</p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Host unforgettable events and help the right people find them fast.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-textmuted">
              PlanTogether gives you a polished home for creating, discovering, and managing upcoming events with real-time updates and a clean experience across desktop and mobile.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/explore" className="button-primary">
                Explore Events
              </Link>
              <Link to={isAuthenticated ? "/create" : "/register"} className="button-secondary">
                {isAuthenticated ? "Create an Event" : "Create Your Account"}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-textmuted">Plan</p>
              <p className="mt-5 text-4xl font-bold text-white">6</p>
              <p className="mt-3 text-sm text-textmuted">Built-in categories to help attendees find the right vibe instantly.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-textmuted">Secure</p>
              <p className="mt-5 text-4xl font-bold text-white">JWT</p>
              <p className="mt-3 text-sm text-textmuted">Token-based authentication keeps private creation tools behind login.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-surface p-6 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.28em] text-textmuted">Live workflow</p>
              <p className="mt-4 text-2xl font-bold text-white">Create, edit, and remove events without stale screens.</p>
              <p className="mt-3 text-sm text-textmuted">The shared event state refreshes the explore feed and your dashboard right after each change.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-light">Upcoming picks</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">What's happening next</h2>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-accent-light">
            Browse all events
          </Link>
        </div>

        {eventsLoading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading upcoming events...</div>
        ) : events.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8">
            <h3 className="text-2xl font-bold text-white">No upcoming events yet</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-textmuted">
              Start the momentum by creating the first event in your community.
            </p>
            <Link to={isAuthenticated ? "/create" : "/register"} className="button-primary mt-6">
              {isAuthenticated ? "Create the first event" : "Sign up to host"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} showOwner />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
