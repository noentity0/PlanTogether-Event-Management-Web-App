function formatValidationMessage(issue) {
  if (!issue || typeof issue !== "object") {
    return "Invalid request.";
  }

  const path = Array.isArray(issue.loc)
    ? issue.loc.filter((part) => part !== "body").join(" ")
    : "";

  if (path && issue.msg) {
    return `${path}: ${issue.msg}`;
  }

  return issue.msg || "Invalid request.";
}

export function formatApiError(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map(formatValidationMessage).join(" ");
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return fallbackMessage;
}
