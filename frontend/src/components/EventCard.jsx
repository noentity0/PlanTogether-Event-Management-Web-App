import { Link } from "react-router-dom";

import { formatEventDate, formatEventTime } from "../utils/formatters";

const categoryStyles = {
  Music: "bg-accent/15 text-accent-light",
  Tech: "bg-accent/15 text-accent-light",
  Sports: "bg-accent/15 text-accent-light",
  Art: "bg-accent/15 text-accent-light",
  Food: "bg-accent/15 text-accent-light",
  Business: "bg-accent/15 text-accent-light",
};

function EventCard({ event, showOwner = false }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="glass-panel group flex h-full flex-col rounded-[2rem] p-6 transition hover:-translate-y-1 hover:bg-[#232323] focus:outline-none focus:ring-2 focus:ring-accent/60"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[event.category]}`}>
          {event.category}
        </span>
        <span className="text-xs uppercase tracking-[0.22em] text-textmuted">
          {formatEventDate(event.date)}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">{event.title}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-textmuted">{event.description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-textmuted">
        <span className="rounded-full border border-white/10 px-3 py-1">
          {event.attendee_count} registered
        </span>
        {event.capacity ? (
          <span className="rounded-full border border-white/10 px-3 py-1">
            {event.available_spots} spots left
          </span>
        ) : null}
      </div>

      <div className="mt-6 space-y-2 text-sm text-textmuted">
        <p>
          <span className="text-[#8D8D8D]">When:</span> {formatEventTime(event.time)}
        </p>
        <p>
          <span className="text-[#8D8D8D]">Where:</span> {event.location}
        </p>
        {showOwner && (
          <p>
            <span className="text-[#8D8D8D]">Host:</span> {event.created_by_name}
          </p>
        )}
      </div>
    </Link>
  );
}

export default EventCard;
