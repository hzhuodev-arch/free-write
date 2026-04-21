import { useState } from "react";

const USER_ID_KEY = "free-write:userId";

export function useUserId(): string {
  const [userId] = useState(() => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  });

  return userId;
}
