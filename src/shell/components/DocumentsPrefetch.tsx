import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useUserId } from "#/lib/hooks/use-user-id";

function Subscriber() {
  const userId = useUserId();
  useQuery(api.documents.listByUserId, { userId });
  return null;
}

export default function DocumentsPrefetch() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Subscriber />;
}
