import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import { useAuth } from "../../src/context/AuthContext";

jest.mock("../../src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("ProtectedRoute", () => {
  test("shows a loading state while the session is being checked", () => {
    useAuth.mockReturnValue({ loading: true, isAuthenticated: false });

    render(
      <MemoryRouter
        initialEntries={["/profile"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProtectedRoute>
          <div>Private page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Checking your session...")).toBeInTheDocument();
  });

  test("redirects guests to the login page", () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: false });

    render(
      <MemoryRouter
        initialEntries={["/profile"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  test("renders the child route for authenticated users", () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: true });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProtectedRoute>
          <div>Private page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Private page")).toBeInTheDocument();
  });
});
