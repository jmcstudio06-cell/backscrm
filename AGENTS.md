# Project decisions

- Backs Radar imports public BacksAI places into `radar_places` on demand and queries the local cache by selected cities; this preserves a single login and avoids Google in lead search.
- Backs Radar searches are authorized on the server against the Executive plan and manual overrides even for admins; client-side locks alone cannot protect contact data, and admin status must not bypass the selected plan.
- Engagement `last_seen` records actual visible app visits and user interactions (throttled), not auth refresh or profile creation; otherwise inactivity counts misrepresent usage.
- Push permission is requested only while the browser state is `default`; granted subscriptions are repaired silently and must never reopen the activation prompt.
- Plan renewals may keep the purchased tier or upgrade, but never downgrade; enforce this in both the access manager and checkout function.
- Agenda indicators use normalized status roles: open excludes completed/cancelled, confirmed is exact, and performed is completed only; this prevents overlapping KPI meanings.