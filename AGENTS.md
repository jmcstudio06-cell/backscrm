# Project decisions

- Keep interactive landing previews in a separate presentation-only module with empty user data; visitors explore features without changing account data.
- Scope landing visual tokens, typography and motion to the landing root; exclude it from artist compatibility locks, use once-per-element scroll reveals, and offer explicit motion opt-in for reduced-motion visitors so account settings cannot silently disable public presentation or override accessibility preferences.
- Scope authentication presentation styles to its page root and preserve existing auth handlers; visual updates must not affect artist themes or account behavior.
- Persist signup artist details through a validated profile trigger reading auth metadata; capture registration details even when email confirmation delays the first session, without changing trial provisioning.

- Keep landing share metadata in the static HTML head as well as the route head; social crawlers do not execute client-side metadata updates.

- Checkout amounts and tier identity come from the server plan configuration, and provider link creation must fail closed without static-link fallback; stale links can charge for a different tier.

- Backs Radar imports public BacksAI places into `radar_places` on demand and queries the local cache by selected cities; this preserves a single login and avoids Google in lead search.
- Backs Radar searches are authorized on the server against the Executive plan and manual overrides even for admins; client-side locks alone cannot protect contact data, and admin status must not bypass the selected plan.
- Engagement `last_seen` records actual visible app visits and user interactions (throttled), not auth refresh or profile creation; otherwise inactivity counts misrepresent usage.
- Push permission is requested only while the browser state is `default`; granted subscriptions are repaired silently and must never reopen the activation prompt.
- The access manager displays every current tier and marks the user's tier for renewal; lower tiers remain visible but disabled, and checkout still rejects downgrades to prevent invalid purchases.
- Agenda indicators use normalized status roles: open excludes completed/cancelled, confirmed is exact, and performed is completed only; this prevents overlapping KPI meanings.