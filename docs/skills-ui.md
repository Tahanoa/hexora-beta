# Skills capability atlas

The `/skills` page renders live `/api/skills/public` data with category distribution, searchable/filterable cards, locale-aware sorting, optional descriptions and native detail dialogs. Homepage skills, biography icons and all API/backend contracts stay unchanged. The legacy atelier remains a fallback if the dedicated script is unavailable.

Motion direction: calm, precise product UI. One easing family (`cubic-bezier(.2,0,0,1)`), 180ms feedback, 360ms entrances, 35ms card stagger capped at 175ms, travel capped at 12px. Nothing loops automatically. Search updates do not animate/recreate the search field. Reduced-motion and the shared site preference suppress entrance movement; focus and selected-state styling remain visible.

Counts and category-column heights reflect the returned dataset, not proficiency. Skill levels are the profile's self-entered values, clamped to 0–100; missing levels are labelled rather than invented. All user text and icon attributes are escaped/validated. Filters and sorting survive language changes. Empty data and no-match states provide actual next actions.
