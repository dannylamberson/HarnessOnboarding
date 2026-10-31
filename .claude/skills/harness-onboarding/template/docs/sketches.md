# Sketches at Scope

Throwaway HTML pictures of new UI, so {{USER}} sees the idea before the spec is signed off and before any real code or
migration exists. Read on demand by `pipeline-scope`, and by `pipeline-poc` when it builds the picked sketch.

> Why: on the project this came from, UI iteration was where POC and QA sessions burned the most rounds, and a
> layout argument settled at QA sometimes meant a second migration. A sketch settles in one look what a spec paragraph
> leaves open; in the first dry run the user called the sketch "clearer" than the spec it illustrated.

## When

- **Sketch** when the card adds a new screen, a new component or a new way of interacting.
- **Waive** when it only reuses what exists (a field added to an existing form, a copy change): the spec says
  `Sketch: waived (reason)`.
- **No UI** at all (a migration, a function, a job): the spec has no Sketch section.
- {{USER}} can ask for a sketch or waive one either way.

## What a sketch is

- One HTML file per screen or flow in `sketches/<slug>/` at the repo root. The folder is gitignored, so nothing in it
  is reviewed, tested or shipped.
- Static HTML and CSS: no framework, no component imports, no build. It links the real design tokens by relative
  path (`{{TOKENS_PATH}}`), so colors, spacing and type match the app and dark mode follows the system setting.
- {{FRAMES}}. When there's a real choice, 2–3 options side by side, labelled **A**, **B**, **C**, with today's screen
  first as **Now** when the card changes an existing one. Let the frames wrap, sized `width: min(<frame>px, 100%)`,
  so the same file reads in one column on a phone.
- Give `html` the page background from the tokens, or translucent tokens vanish over the browser's default white.
- The states that matter: usually typical plus one of empty or many. Placeholder data that looks real, not lorem ipsum.
- Under each option, one line on what it costs or risks. Keep it rough: a sketch is for the idea, not the pixels.

## Show it

1. Desktop first: open the file in the browser pane (`file:///<clone>/sketches/<slug>/<file>.html`).
2. Phone when {{USER}} wants it in hand: serve the repo over the LAN (`{{DEV_CMD}} -- --host`, or any static server)
   and open `http://<LAN IP>:<port>/sketches/<slug>/<file>.html`. Put the URL in chat text first.
3. Ask which option with `AskUserQuestion`, and iterate in the same file until {{USER}} picks. Small changes are cheap;
   a new option is a new column.

## Record it

- Screenshot only the chosen option's frames (the browser pane, or Playwright).
- Attach it to the spec comment on the Linear issue (Linear's file upload, then embed the returned markdown).
- The spec's **Sketch** section: the option picked, what changed after feedback, and what was left to POC.

## At POC

The POC builds the approved sketch with the real components. A UI card that reaches POC with neither a Sketch section
nor a waiver gets sketched first, whichever way it got there.
