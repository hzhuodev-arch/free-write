import { useState } from "react";

const SESSION_ID_KEY = "free-write:sessionId";

export function useSessionId(): string {
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  });

  return sessionId;
}
