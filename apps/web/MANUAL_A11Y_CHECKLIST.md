# Manual Accessibility Checklist

1. Keyboard-only navigation
   - Use `Tab` and `Shift+Tab` from top of page on `/`, `/docs`, `/pricing`, `/studio`, and `/app/jobs`.
   - Confirm visible focus indicator is present for every interactive control.
   - Confirm `Enter`/`Space` activate buttons and links.

2. Skip link + landmark validation
   - On each tested page, press `Tab` once and activate “Skip to content”.
   - Confirm focus moves to `#main-content` and main region is reachable.

3. Dialog and drawer behavior
   - Open each modal/drawer reachable from `/studio` and `/app/approvals`.
   - Confirm `Esc` closes it.
   - Confirm focus returns to the triggering control when it closes.

4. Screen reader smoke test
   - Use VoiceOver/NVDA to read heading structure on `/`, `/product`, `/docs`, and `/pricing`.
   - Confirm a single H1 per page and logical H2/H3 order.

5. Status and error updates
   - Trigger job state updates in `/app/jobs` and approval state changes in `/app/approvals`.
   - Confirm updates are announced politely (no rapid-fire interruptions).
