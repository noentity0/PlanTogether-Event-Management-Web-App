import { useState } from "react";

import { EVENT_CATEGORIES } from "../data/categories";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "Tech",
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

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");

    if (Object.values(form).some((value) => !String(value).trim())) {
      setValidationError("Please complete every field before submitting.");
      return;
    }

    await onSubmit(form);
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
              className="input-base"
            >
              {EVENT_CATEGORIES.filter((category) => category !== "All").map((category) => (
                <option key={category} value={category} className="bg-field">
                  {category}
                </option>
              ))}
            </select>
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
