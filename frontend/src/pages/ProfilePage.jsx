import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { formatDateTime } from "../utils/formatters";

function EventCollection({ title, subtitle, events, emptyMessage, emptyActionLabel, emptyActionTo }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-textmuted">{subtitle}</p>
      </div>

      {events.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-8">
          <p className="text-sm text-textmuted">{emptyMessage}</p>
          {emptyActionLabel && emptyActionTo ? (
            <Link to={emptyActionTo} className="button-secondary mt-5">
              {emptyActionLabel}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} showOwner />
          ))}
        </div>
      )}
    </section>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const {
    fetchMyEvents,
    fetchMyRegisteredEvents,
    fetchMyBookmarkedEvents,
  } = useEvents();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfileCollections() {
      setLoading(true);
      setError("");

      try {
        const [created, registered, bookmarked] = await Promise.all([
          fetchMyEvents(),
          fetchMyRegisteredEvents(),
          fetchMyBookmarkedEvents(),
        ]);
        setCreatedEvents(created);
        setRegisteredEvents(registered);
        setSavedEvents(bookmarked);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProfileCollections();
  }, []);

  const nextHostedEvent = createdEvents[0];
  const nextRegisteredEvent = registeredEvents[0];

  if (loading) {
    return <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading your profile...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-white">Profile unavailable</h1>
        <p className="mt-3 text-sm text-textmuted">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Your profile</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {user?.name ? `Welcome, ${user.name}` : "Event profile"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-textmuted">
              Keep track of the events you host, register for, save, and follow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/create" className="button-primary">
                Create Event
              </Link>
              <Link to="/explore" className="button-secondary">
                Explore Events
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface p-6">
            <p className="text-base font-semibold text-white">{user?.name || "Event host"}</p>
            <p className="mt-1 text-sm text-textmuted">{user?.email}</p>
            <p className="mt-5 text-sm leading-6 text-textmuted">
              Manage your hosted events, keep an eye on upcoming registrations, and jump back into saved plans anytime.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-field px-4 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Hosted Events</p>
            <p className="mt-3 text-3xl font-bold text-white">{createdEvents.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-field px-4 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Registered Events</p>
            <p className="mt-3 text-3xl font-bold text-white">{registeredEvents.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-field px-4 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Saved Events</p>
            <p className="mt-3 text-3xl font-bold text-white">{savedEvents.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-field px-4 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Next Hosted</p>
            <p className="mt-3 text-sm font-medium leading-6 text-white">
              {nextHostedEvent ? formatDateTime(nextHostedEvent.date, nextHostedEvent.time) : "No hosted events yet"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-field px-4 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Next Attending</p>
            <p className="mt-3 text-sm font-medium leading-6 text-white">
              {nextRegisteredEvent ? formatDateTime(nextRegisteredEvent.date, nextRegisteredEvent.time) : "No registrations yet"}
            </p>
          </div>
        </div>
      </section>

      <EventCollection
        title="Hosted events"
        subtitle="Everything you have created and published."
        events={createdEvents}
        emptyMessage="You have not created any events yet."
        emptyActionLabel="Create your first event"
        emptyActionTo="/create"
      />

      <EventCollection
        title="My registrations"
        subtitle="Events you are officially attending."
        events={registeredEvents}
        emptyMessage="You have not registered for any events yet."
        emptyActionLabel="Explore events"
        emptyActionTo="/explore"
      />

      <EventCollection
        title="Saved events"
        subtitle="Your bookmarked events for later."
        events={savedEvents}
        emptyMessage="You have not saved any events yet."
        emptyActionLabel="Browse events"
        emptyActionTo="/explore"
      />
    </div>
  );
}

export default ProfilePage;
