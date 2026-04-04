import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EventForm from "../components/EventForm";
import { useEvents } from "../context/EventContext";
import { formatApiError } from "../utils/apiErrors";

function CreateEventPage() {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(form) {
    setError("");
    setIsSubmitting(true);

    try {
      await createEvent(form);
      navigate("/profile");
    } catch (requestError) {
      setError(formatApiError(requestError, "Unable to create the event."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <EventForm
      heading="Create a new event"
      descriptionText="Fill in the essentials, set an optional capacity, and publish an event people can discover, save, and join right away."
      submitLabel="Publish event"
      serverError={error}
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
    />
  );
}

export default CreateEventPage;
