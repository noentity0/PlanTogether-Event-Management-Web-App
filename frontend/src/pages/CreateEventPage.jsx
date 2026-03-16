import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EventForm from "../components/EventForm";
import { useEvents } from "../context/EventContext";

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
      setError(requestError.response?.data?.detail || "Unable to create the event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <EventForm
      heading="Create a new event"
      descriptionText="Fill in the essentials and publish an event that attendees can discover right away."
      submitLabel="Publish event"
      serverError={error}
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
    />
  );
}

export default CreateEventPage;

