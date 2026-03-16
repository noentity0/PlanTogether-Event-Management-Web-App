import { useEffect } from "react";
import { Link } from "react-router-dom";

import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { formatDateTime } from "../utils/formatters";

function ProfilePage() {
  const { user } = useAuth();
  const { myEvents, myEventsLoading, fetchMyEvents } = useEvents();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const nextEvent = myEvents[0];

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Your dashboard</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Manage the events you've created</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-textmuted">
              Track everything in one place, jump back into edits, and keep your event lineup current.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface p-6">
            <p className="text-sm text-textmuted">{user?.email}</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Created</p>
                <p className="mt-2 text-3xl font-bold text-white">{myEvents.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-textmuted">Next up</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {nextEvent ? formatDateTime(nextEvent.date, nextEvent.time) : "No events yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {myEventsLoading ? (
        <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading your events...</div>
      ) : myEvents.length === 0 ? (
        <div className="glass-panel rounded-[2rem] p-10">
          <h2 className="text-3xl font-bold text-white">You haven't created any events yet</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-textmuted">
            Start by publishing your first event and it will appear here immediately.
          </p>
          <Link to="/create" className="button-primary mt-6">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {myEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
