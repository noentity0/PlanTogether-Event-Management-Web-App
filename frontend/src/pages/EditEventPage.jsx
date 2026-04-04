import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EventForm from "../components/EventForm";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { formatApiError } from "../utils/apiErrors";

function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, updateEvent } = useEvents();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
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

  async function handleUpdate(form) {
    setError("");
    setIsSubmitting(true);

    try {
      await updateEvent(eventId, form);
      navigate(`/events/${eventId}`);
    } catch (requestError) {
      setError(formatApiError(requestError, "Unable to update the event."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="glass-panel rounded-[2rem] p-8 text-sm text-textmuted">Loading event editor...</div>;
  }

  if (error && !event) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-white">Editor unavailable</h1>
        <p className="mt-3 text-sm text-textmuted">{error}</p>
      </div>
    );
  }

  if (user?.id !== event?.created_by) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-white">You can't edit this event</h1>
        <p className="mt-3 text-sm text-textmuted">Only the original creator can update these details.</p>
      </div>
    );
  }

  return (
    <EventForm
      heading="Edit your event"
      descriptionText="Adjust the details, capacity, and timing without creating a duplicate listing."
      initialValues={{
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        capacity: event.capacity ?? "",
      }}
      submitLabel="Save changes"
      serverError={error}
      isSubmitting={isSubmitting}
      onSubmit={handleUpdate}
    />
  );
}

export default EditEventPage;
