import { createContext, useContext, useRef, useState } from "react";

import axiosClient from "../api/axiosClient";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ search: "", category: "All", includePast: false });
  const latestEventsRequestRef = useRef(0);

  function syncEventInCollections(updatedEvent) {
    if (!updatedEvent?.id) {
      return;
    }

    setEvents((current) => current.map((event) => (event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event)));
    setMyEvents((current) => current.map((event) => (event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event)));
  }

  async function fetchEvents(filters = activeFilters, options = {}) {
    const requestId = latestEventsRequestRef.current + 1;
    latestEventsRequestRef.current = requestId;
    setEventsLoading(true);
    setActiveFilters({
      search: filters.search || "",
      category: filters.category || "All",
      includePast: Boolean(filters.includePast),
    });

    try {
      const { data } = await axiosClient.get("/api/events", {
        params: {
          search: filters.search || undefined,
          category: filters.category && filters.category !== "All" ? filters.category : undefined,
          include_past: filters.includePast || undefined,
        },
        signal: options.signal,
      });
      if (requestId === latestEventsRequestRef.current) {
        setEvents(data);
      }
      return data;
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        return null;
      }
      throw error;
    } finally {
      if (requestId === latestEventsRequestRef.current) {
        setEventsLoading(false);
      }
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

  async function fetchMyRegisteredEvents() {
    const { data } = await axiosClient.get("/api/events/my/registered");
    return data;
  }

  async function fetchMyBookmarkedEvents() {
    const { data } = await axiosClient.get("/api/events/my/bookmarked");
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
    syncEventInCollections(data);
    await fetchEvents(activeFilters);
    if (localStorage.getItem("plantogether_token")) {
      await fetchMyEvents();
    }
    return data;
  }

  async function deleteEvent(eventId) {
    await axiosClient.delete(`/api/events/${eventId}`);
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setMyEvents((current) => current.filter((event) => event.id !== eventId));
    await fetchEvents(activeFilters);
    if (localStorage.getItem("plantogether_token")) {
      await fetchMyEvents();
    }
  }

  async function registerForEvent(eventId) {
    const { data } = await axiosClient.post(`/api/events/${eventId}/register`);
    syncEventInCollections(data);
    return data;
  }

  async function leaveEventRegistration(eventId) {
    const { data } = await axiosClient.delete(`/api/events/${eventId}/register`);
    syncEventInCollections(data);
    return data;
  }

  async function bookmarkEvent(eventId) {
    const { data } = await axiosClient.post(`/api/events/${eventId}/bookmark`);
    syncEventInCollections(data);
    return data;
  }

  async function removeBookmark(eventId) {
    const { data } = await axiosClient.delete(`/api/events/${eventId}/bookmark`);
    syncEventInCollections(data);
    return data;
  }

  async function addComment(eventId, message) {
    const { data } = await axiosClient.post(`/api/events/${eventId}/comments`, { message });
    syncEventInCollections(data);
    return data;
  }

  async function deleteComment(eventId, commentId) {
    const { data } = await axiosClient.delete(`/api/events/${eventId}/comments/${commentId}`);
    syncEventInCollections(data);
    return data;
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
        fetchMyRegisteredEvents,
        fetchMyBookmarkedEvents,
        getEvent,
        createEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        leaveEventRegistration,
        bookmarkEvent,
        removeBookmark,
        addComment,
        deleteComment,
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
