import { useState } from "react";

import { EVENT_CATEGORIES } from "../data/categories";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "Tech",
  capacity: "",
};

function EventForm({
  heading,
  descriptionText,
  initialValues = emptyForm,
  submitLabel,
  isSubmitting,
  serverError,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [validationError, setValidationError] = useState("");

  function validateForm(currentForm) {
    const title = currentForm.title.trim();
    const description = currentForm.description.trim();
    const location = currentForm.location.trim();
    const validCategories = EVENT_CATEGORIES.filter((category) => category !== "All");

    if (!title || !description || !currentForm.date || !currentForm.time || !location || !currentForm.category) {
      return "Please complete every field before submitting.";
    }

    if (title.length < 3 || title.length > 120) {
      return "Title must be between 3 and 120 characters.";
    }

    if (description.length < 10 || description.length > 1500) {
      return "Description must be between 10 and 1500 characters.";
    }

    if (location.length < 2 || location.length > 200) {
      return "Location must be between 2 and 200 characters.";
    }

    if (!validCategories.includes(currentForm.category)) {
      return "Please choose a valid event category.";
    }

    if (currentForm.capacity) {
      const capacityValue = Number(currentForm.capacity);
      if (!Number.isInteger(capacityValue) || capacityValue < 1 || capacityValue > 10000) {
        return "Capacity must be a whole number between 1 and 10000.";
      }
    }

    return "";
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");

    const error = validateForm(form);
    if (error) {
      setValidationError(error);
      return;
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      capacity: form.capacity ? Number(form.capacity) : null,
    });
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <section className="mx-auto max-w-4xl">
      <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-accent-light">Event Studio</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">{heading}</h1>
          <p className="mt-3 text-sm leading-6 text-textmuted">{descriptionText}</p>
        </div>

        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              minLength={3}
              maxLength={120}
              required
              className="input-base"
              placeholder="Midnight Product Launch"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              minLength={10}
              maxLength={1500}
              required
              className="input-base min-h-36 resize-none"
              placeholder="Tell guests why this event is worth showing up for."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              min={minDate}
              value={form.date}
              onChange={handleChange}
              required
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="time">
              Time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              minLength={2}
              maxLength={200}
              required
              className="input-base"
              placeholder="Bangalore Convention Hall"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="input-base"
            >
              {EVENT_CATEGORIES.filter((category) => category !== "All").map((category) => (
                <option key={category} value={category} className="bg-field">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="capacity">
              Capacity
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              max="10000"
              value={form.capacity}
              onChange={handleChange}
              className="input-base"
              placeholder="Optional"
            />
          </div>

          {(validationError || serverError) && (
            <div className="sm:col-span-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light">
              {validationError || serverError}
            </div>
          )}

          <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EventForm;
