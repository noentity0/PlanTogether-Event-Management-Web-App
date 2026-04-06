import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import EventForm from "../../src/components/EventForm";

describe("EventForm", () => {
  test("shows a validation message when required fields are missing", async () => {
    const onSubmit = jest.fn();

    const { container } = render(
      <EventForm
        heading="Create Event"
        descriptionText="Create a brand-new event."
        submitLabel="Create"
        isSubmitting={false}
        serverError=""
        onSubmit={onSubmit}
      />
    );

    fireEvent.submit(container.querySelector("form"));

    expect(await screen.findByText("Please complete every field before submitting.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("trims values and converts capacity before submit", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <EventForm
        heading="Create Event"
        descriptionText="Create a brand-new event."
        submitLabel="Create"
        isSubmitting={false}
        serverError=""
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  Launch Night  " } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "  A polished description for a future event.  " },
    });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2099-06-20" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "18:30" } });
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "  Bangalore Convention Hall  " } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Tech" } });
    fireEvent.change(screen.getByLabelText("Capacity"), { target: { value: "75" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Launch Night",
        description: "A polished description for a future event.",
        date: "2099-06-20",
        time: "18:30",
        location: "Bangalore Convention Hall",
        category: "Tech",
        capacity: 75,
      });
    });
  });
});
