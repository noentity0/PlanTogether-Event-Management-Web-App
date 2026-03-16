import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { formatDateTime } from "../utils/formatters";

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getEvent, deleteEvent } = useEvents();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");
      try {
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load the event.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this event permanently?");
    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteEvent(eventId);
      navigate("/profile");
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.detail || "Unable to delete the event.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading event details...</div>;
  }

  if (error || !event) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-white">Event not available</h1>
        <p className="mt-3 text-sm text-textmuted">{error || "This event may have been removed."}</p>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === event.created_by;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent-light">
            {event.category}
          </span>
          <span className="text-xs uppercase tracking-[0.28em] text-textmuted">Hosted by {event.created_by_email}</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{event.title}</h1>
        <p className="mt-6 whitespace-pre-line text-base leading-8 text-textmuted">{event.description}</p>
      </div>

      <aside className="space-y-6">
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-light">Event details</p>
          <div className="mt-6 space-y-4 text-sm text-textmain">
            <div>
              <p className="text-textmuted">When</p>
              <p className="mt-1 text-base text-white">{formatDateTime(event.date, event.time)}</p>
            </div>
            <div>
              <p className="text-textmuted">Where</p>
              <p className="mt-1 text-base text-white">{event.location}</p>
            </div>
            <div>
              <p className="text-textmuted">Category</p>
              <p className="mt-1 text-base text-white">{event.category}</p>
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-light">Manage</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/events/${event.id}/edit`} className="button-primary">
                Edit Event
              </Link>
              <button type="button" onClick={handleDelete} className="button-secondary" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            {deleteError && <p className="mt-4 text-sm text-accent-light">{deleteError}</p>}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-sm leading-6 text-textmuted">
              Sign in with the event owner account to edit or remove this event.
            </p>
          </div>
        )}
      </aside>
    </section>
  );
}

export default EventDetailsPage;
