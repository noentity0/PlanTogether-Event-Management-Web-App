import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { formatDateTime } from "../utils/formatters";
import { formatApiError } from "../utils/apiErrors";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-textmuted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-textmuted">{hint}</p> : null}
    </div>
  );
}

function PeopleList({ title, people, emptyMessage }) {
  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-light">{title}</p>
      {people?.length ? (
        <div className="mt-5 space-y-3">
          {people.map((person) => (
            <div key={person.user_id || person.id} className="rounded-2xl border border-white/10 bg-surface px-4 py-3">
              <p className="font-semibold text-white">{person.name}</p>
              <p className="mt-1 text-sm text-textmuted">{person.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-textmuted">{emptyMessage}</p>
      )}
    </div>
  );
}

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    getEvent,
    deleteEvent,
    registerForEvent,
    leaveEventRegistration,
    bookmarkEvent,
    removeBookmark,
    addComment,
    deleteComment,
  } = useEvents();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");
      try {
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (requestError) {
        setError(formatApiError(requestError, "Unable to load the event."));
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function runAction(actionName, actionFn) {
    setActionError("");
    setShareMessage("");
    setActiveAction(actionName);
    try {
      const updatedEvent = await actionFn();
      setEvent(updatedEvent);
    } catch (requestError) {
      setActionError(formatApiError(requestError, "Unable to update the event right now."));
    } finally {
      setActiveAction("");
    }
  }

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
      setDeleteError(formatApiError(requestError, "Unable to delete the event."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCommentSubmit(submitEvent) {
    submitEvent.preventDefault();
    const message = commentMessage.trim();
    if (!message) {
      return;
    }

    setActionError("");
    setIsSubmittingComment(true);
    try {
      const updatedEvent = await addComment(eventId, message);
      setEvent(updatedEvent);
      setCommentMessage("");
    } catch (requestError) {
      setActionError(formatApiError(requestError, "Unable to post your comment."));
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleShare() {
    const eventUrl = window.location.href;
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: `Check out this event on PlanTogether: ${event?.title}`,
          url: eventUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(eventUrl);
      }
      setShareMessage("Event link ready to share.");
    } catch {
      setShareMessage("Sharing was canceled.");
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
  const registerLabel = event.is_registered ? "Leave Event" : "Register";
  const bookmarkLabel = event.is_bookmarked ? "Saved" : "Save Event";
  const isEventFull = Boolean(event.capacity && event.available_spots === 0 && !event.is_registered);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent-light">
              {event.category}
            </span>
            <span className="text-xs uppercase tracking-[0.28em] text-textmuted">Hosted by {event.created_by_name}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{event.title}</h1>
          <p className="mt-4 text-sm text-textmuted">
            Hosted by {event.created_by_name}
            {event.created_by_email ? ` (${event.created_by_email})` : ""}
          </p>
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-textmuted">{event.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard label="Total Registered" value={event.attendee_count} hint="People registered for this event" />
            <StatCard
              label="Capacity"
              value={event.capacity ?? "Open"}
              hint={event.capacity ? `${event.available_spots} spots left` : "No attendee limit"}
            />
          </div>
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
              <div>
                <p className="text-textmuted">Status</p>
                <p className="mt-1 text-base text-white">
                  {event.is_registered ? "Registered" : isEventFull ? "Full" : "Open to join"}
                </p>
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
              {deleteError ? <p className="mt-4 text-sm text-accent-light">{deleteError}</p> : null}
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent-light">Join in</p>
              {isAuthenticated ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button-primary"
                    disabled={activeAction === "register" || isEventFull}
                    onClick={() =>
                      runAction("register", () =>
                        event.is_registered ? leaveEventRegistration(event.id) : registerForEvent(event.id)
                      )
                    }
                  >
                    {activeAction === "register" ? "Saving..." : registerLabel}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={activeAction === "bookmark"}
                    onClick={() =>
                      runAction("bookmark", () =>
                        event.is_bookmarked ? removeBookmark(event.id) : bookmarkEvent(event.id)
                      )
                    }
                  >
                    {activeAction === "bookmark" ? "Saving..." : bookmarkLabel}
                  </button>
                  <button type="button" className="button-secondary" onClick={handleShare}>
                    Share
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-textmuted">
                  <Link to="/login" className="font-semibold text-accent-light">
                    Sign in
                  </Link>{" "}
                  or{" "}
                  <Link to="/register" className="font-semibold text-accent-light">
                    create an account
                  </Link>{" "}
                  to register, save this event, or join the conversation.
                </p>
              )}
              {shareMessage ? <p className="mt-4 text-sm text-accent-light">{shareMessage}</p> : null}
              {isEventFull ? <p className="mt-4 text-sm text-textmuted">This event has reached its capacity.</p> : null}
              {actionError ? <p className="mt-4 text-sm text-accent-light">{actionError}</p> : null}
            </div>
          )}
        </aside>
      </section>

      {isOwner ? (
        <section className="grid gap-6">
          <PeopleList title="Registered attendees" people={event.registrations} emptyMessage="No one has registered yet." />
        </section>
      ) : null}

      <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Conversation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Questions and comments</h2>
          </div>
        </div>

        {isAuthenticated ? (
          <form className="mt-8 space-y-4" onSubmit={handleCommentSubmit}>
            <textarea
              value={commentMessage}
              onChange={(inputEvent) => setCommentMessage(inputEvent.target.value)}
              className="input-base min-h-28 resize-none"
              maxLength={600}
              placeholder="Ask a question, share a thought, or leave a note for the host."
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="button-primary" disabled={isSubmittingComment}>
                {isSubmittingComment ? "Posting..." : "Post comment"}
              </button>
              <p className="text-sm text-textmuted">{commentMessage.trim().length}/600</p>
            </div>
          </form>
        ) : (
          <p className="mt-6 text-sm text-textmuted">
            Sign in to comment and interact with this event.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {event.comments?.length ? (
            event.comments.map((comment) => {
              const canDeleteComment = isAuthenticated && (comment.author.id === user?.id || isOwner);
              return (
                <div key={comment.id} className="rounded-[1.75rem] border border-white/10 bg-surface p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{comment.author.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-textmuted">{comment.author.email}</p>
                    </div>
                    {canDeleteComment ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-accent-light"
                        onClick={() => runAction("comment-delete", () => deleteComment(event.id, comment.id))}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-textmuted">{comment.message}</p>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 p-6 text-sm text-textmuted">
              No comments yet. Be the first to start the conversation.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default EventDetailsPage;
