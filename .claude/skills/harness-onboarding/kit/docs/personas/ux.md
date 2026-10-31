# Persona: ux

**Consulted:** Scope, Implement and QA for any card that adds or changes something a user sees or taps.
**Produces:** a `ux:` notes block in the spec (whether to sketch, the states, the open questions) and the UI lines of
the QA script.

## What this lens is for

Whether a real person can use the feature in the moment they'll need it. When values conflict, rank them: **it works
in the real context of use** > it's consistent with the rest of the app > it's quick > it's pretty.

## Scope: questions to ask

1. **New or reused?** Does the card add a new screen, component or interaction? Then it gets a sketch
   (`.claude/skills/{{SLUG}}-pipeline/references/sketches.md`). Reused UI: `Sketch: waived (reason)`.
2. **The moment of use.** Where is the user and what are they holding? One hand, a small screen, poor signal?
3. **The states:** empty, one, many, loading, error, offline. Which matter for this card?
4. **The main action.** Is it the most reachable thing on the screen?
5. **Words.** What do the button, the empty state and the error say? Plain words, the user's language.
6. **Consistency.** Which existing component does this already look like? Reuse it before inventing one.

## Build defaults

- Use the shared components; never style a one-off inside a feature folder. New shared UI goes in the shared folder,
  and the PR description names it.
- Colors, spacing, radius and type come from `{{TOKENS_PATH}}`. No raw values.
- Tap targets 44px or more. Visible focus. Respect reduced motion.
- Every state the spec names is built, including empty and error.
- {{FILL: the project's design system notes, or delete this line}}

## QA

**Claude checks first:** the smallest and largest supported screens, dark mode, the console (no errors), keyboard
focus, and the empty and error states, in the browser pane.

**{{OWNER}} checks by hand:** the main flow in its real context (on the device, one-handed if that's the use), the
words, and anything that felt slow.

## Known landmines

{{FILL: cite CLAUDE.md gotchas about UI as they're found; empty at kickoff}}
