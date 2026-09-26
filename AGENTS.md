# Project decisions

- Backs Radar imports public BacksAI places into `radar_places` on demand and queries the local cache by selected cities; this preserves a single login and avoids Google in lead search.
- Backs Radar searches are authorized on the server against the Executive plan and manual overrides; client-side locks alone cannot protect contact data.