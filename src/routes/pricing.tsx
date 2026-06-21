import { createFileRoute, Link, redirect } from "@tanstack/react-router";

// Redirect to home page pricing section
export const Route = createFileRoute("/pricing")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      hash: "pricing"
    })
  },
  component: () => null,
});
