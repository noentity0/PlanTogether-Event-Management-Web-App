import { useEffect, useState } from "react";

import EventCard from "../components/EventCard";
import { EVENT_CATEGORIES } from "../data/categories";
import { useEvents } from "../context/EventContext";

function ExplorePage() {
  const { events, eventsLoading, fetchEvents } = useEvents();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchEvents({ search, category });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Discover</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Explore upcoming events</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-textmuted">
          Search by title, description, or location, then narrow the feed by category to find your next event faster.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            className="input-base"
            placeholder="Search events, places, or keywords"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="input-base"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {EVENT_CATEGORIES.map((item) => (
              <option key={item} value={item} className="bg-field">
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {eventsLoading ? (
        <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Refreshing events...</div>
      ) : events.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-10 text-center">
          <h2 className="text-3xl font-bold text-white">Nothing matched that search</h2>
          <p className="mt-3 text-sm leading-6 text-textmuted">
            Try another keyword, switch the category, or create a new event to get the board moving.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} showOwner />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
