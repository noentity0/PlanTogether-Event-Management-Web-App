import { createContext, useContext, useState } from "react";

import axiosClient from "../api/axiosClient";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ search: "", category: "All" });

  async function fetchEvents(filters = activeFilters) {
    setEventsLoading(true);
    setActiveFilters({
      search: filters.search || "",
      category: filters.category || "All",
    });

    try {
      const { data } = await axiosClient.get("/api/events", {
        params: {
          search: filters.search || undefined,
          category: filters.category && filters.category !== "All" ? filters.category : undefined,
        },
      });
      setEvents(data);
      return data;
    } finally {
      setEventsLoading(false);
    }
  }

  async function fetchMyEvents() {
    setMyEventsLoading(true);
    try {
      const { data } = await axiosClient.get("/api/events/my/created");
      setMyEvents(data);
      return data;
    } finally {
      setMyEventsLoading(false);
    }
  }

  async function getEvent(eventId) {
    const { data } = await axiosClient.get(`/api/events/${eventId}`);
    return data;
  }

  async function createEvent(payload) {
    const { data } = await axiosClient.post("/api/events", payload);
    await fetchEvents(activeFilters);
    if (localStorage.getItem("plantogether_token")) {
      await fetchMyEvents();
    }
    return data;
  }

  async function updateEvent(eventId, payload) {
    const { data } = await axiosClient.put(`/api/events/${eventId}`, payload);
    await fetchEvents(activeFilters);
    if (localStorage.getItem("plantogether_token")) {
      await fetchMyEvents();
    }
    return data;
  }

  async function deleteEvent(eventId) {
    await axiosClient.delete(`/api/events/${eventId}`);
    await fetchEvents(activeFilters);
    if (localStorage.getItem("plantogether_token")) {
      await fetchMyEvents();
    }
  }

  return (
    <EventContext.Provider
      value={{
        events,
        myEvents,
        eventsLoading,
        myEventsLoading,
        activeFilters,
        fetchEvents,
        fetchMyEvents,
        getEvent,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
