import { useEffect } from "react";
import { Link } from "react-router-dom";

import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { events, eventsLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents({ search: "", category: "All", includePast: false });
  }, []);

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-light">Home</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Upcoming Events</h1>
          </div>
          <Link to={isAuthenticated ? "/create" : "/register"} className="button-secondary">
            {isAuthenticated ? "Create Event" : "Get Started"}
          </Link>
        </div>

        {eventsLoading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading upcoming events...</div>
        ) : events.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8">
            <h3 className="text-2xl font-bold text-white">No upcoming events found</h3>
            <Link to={isAuthenticated ? "/create" : "/register"} className="button-primary mt-6">
              {isAuthenticated ? "Create the first event" : "Sign up to create events"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} showOwner />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
