---
title: SdP Field OS — Product Experience
document_id: PEXP-001
authority: product-experience
category: product-experience
version: 1.0
last_reviewed: 2026-07-05
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - DATA_MODEL.md
  - MODULE_MAP.md
  - USER_WORKFLOWS.md
  - SYSTEM_INTERACTIONS.md
  - RECIPE_SIMULATOR_INTEGRATION.md
  - FIELD_OS_MVP_ARCHITECTURE.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# PRODUCT_EXPERIENCE — SdP Field OS

## The Operational Experience — v1.0

---

## 0. Nature and scope

This document defines **how Field OS should feel to work with during a real day at the farm.** It designs work, attention, cognitive flow, and operational rhythm — not software, screens, navigation, menus, or UI. It designs the experience the future interface must embody, and remains faithful to the fixed conceptual architecture (every invariant INV-1 … INV-11, every principle PC-01 … PC-12). It introduces no new entity and no new architectural principle; it gives the architecture a *felt form*.

The governing question is no longer "what does the software do?" but "what does it feel like to work with this during a real day?" The answer, in one line: **Field OS should feel like a quiet companion that remembers, so the operator can keep their hands and attention on the mushrooms.** Never an ERP. Never a form-filling application.

---

## 1. Experience philosophy

The operator's real work is cultivation. Field OS is never the work; it is the memory of the work. Every experience decision follows from that subordination.

**Calm.** Cultivation is patient and rhythmic; contamination and colonization move on their own clock. The tool must match that register — unhurried, quiet, never agitated. It should lower the operator's arousal, not raise it.

**Low friction.** The record only exists if it is captured, and it is only captured if capturing is lighter than the note-taking it replaces (US-2 is the single greatest risk to the whole system). Friction is not an inconvenience here; it is an existential threat. Every gram of effort removed is the product working.

**Focused.** Attention is the scarcest resource in a grow room. The tool asks for attention only at the moment of an action and about the object in hand, then gives it back.

**Trustworthy.** Because history is append-only and nothing is ever lost (INV-3), the operator can trust that a captured fact is safe and a mistake is recoverable by a new entry, never a catastrophe. That trust is what lets them move fast without fear.

**Predictable.** A gloved, time-pressed operator cannot relearn a tool. The same action must always feel the same. Predictability is a form of respect.

**Never distracting; always respectful of ongoing work.** The tool never interrupts cultivation to serve itself. Observation precedes intervention (CANON P-08): the biology sets the agenda, and the tool waits to be used, never the reverse.

These support cultivation directly: a calm, low-friction, non-distracting record keeps the operator's cognition on contamination signs, primordia, and moisture — the things that actually determine the harvest — while still producing the faithful memory the remote reviewer and the Knowledge System depend on.

---

## 2. Operational modes

Field OS is experienced as **work modes**, not modules. A mode is an attention profile over the same architecture — the same events, the same anchor — differing only in what the operator is trying to accomplish and how their attention is shaped. Modes are felt, not navigated.

- **Laboratory.** *Begins* when the operator enters sterile agar/spawn work; *ends* when the still-air box work is done. *Goal:* flawless technique under maximal sterility. *Attention:* narrow, deliberate, slow; hands are the instrument and must not be pulled away. The tool must be near-absent here — capture is minimal and can wait for a clean moment.
- **Incubation.** *Begins* at colonization checks; *ends* when a run is judged ready or failed. *Goal:* notice divergence early. *Attention:* periodic, low-touch, comparative across many similar containers. The tool surfaces the container's short history so the eye can compare.
- **Fruiting.** *Begins* on entering the fruiting zones; *ends* when the day's observation round is complete. *Goal:* read conditions and development. *Attention:* environmental and per-object, under humidity and gloves. Capture is observation-heavy.
- **Harvest.** *Begins* when fruit is ready; *ends* when picking and outcome-recording are done. *Goal:* capture outcomes without slowing the pick. *Attention:* fast, hands full, high tempo. The tool must accept the lightest possible gesture and get out of the way.
- **Processing.** *Begins* after harvest; *ends* at disposal or hand-off. *Goal:* record post-harvest outcomes faithfully. *Attention:* moderate, batch-oriented.
- **Research.** *Begins* when exploring or deploying an experimental formulation; *ends* when the experiment is set running. *Goal:* try something new without contaminating production memory. *Attention:* curious, comparative; experimental flag always quietly present (Section 6).
- **Review.** *Begins* when the operator or reviewer steps back to read the record; *ends* when the day is understood. *Goal:* see what happened. *Attention:* reflective, read-only, unhurried; no capture pressure.
- **Maintenance.** *Begins* at cleaning/equipment work; *ends* when done. *Goal:* record what was done to the environment. *Attention:* low, occasional.

The same append-only record underlies every mode; only the operator's intent and attention change. Nothing about modes creates new persistence — they are lenses on one memory.

---

## 3. Operational sessions

A session is the experiential container for a work mode. It is an **interaction construct, never a persistence construct**: it organizes work in the moment and stores nothing of its own. Events persist; sessions do not (FIELD_OS_MVP_ARCHITECTURE §4). This single fact is what makes the session experience forgiving.

- **Beginning.** Opening a session is almost ceremonyless — the operator signals "I am starting lab work now," and the tool quietly assumes their identity and the moment for everything that follows. No setup, no configuration, no cost to starting. Starting should feel like putting on gloves, not like logging in.
- **Working state.** In flow, the tool recedes. The operator acts on containers; each action is captured and confirmed with the lightest possible acknowledgment, then the tool falls silent again. The felt state is *working, occasionally noting* — never *operating an application*.
- **Interruptions.** A farm day is made of interruptions: a phone call, a glove change, a contamination found mid-row, a delivery. The session must tolerate being abandoned mid-gesture at any instant. Because each event persists the moment it is captured, there is never a half-filled form to lose — the most recent captured fact is already safe, and everything before it is history.
- **Completion.** Ending is as light as beginning: the operator simply stops. If they forget to "end," nothing breaks, because the session persisted nothing that needs closing — the events already stand on their own.
- **Recovery after interruption.** Returning after any gap, the operator finds nothing to reconstruct: their prior captures are already immutable history, and they simply resume. A session that "evaporated" during an interruption costs nothing, because it was never a stored thing — it was only a frame for attention.
- **How sessions reduce cognitive load.** They attribute and time-stamp once instead of per action; they carry the current mode's context so the operator is not re-establishing "where am I and who am I" on every entry; and they let the operator hold their intent ("I'm doing the fruiting round") while the tool handles the bookkeeping beneath it. The operator carries the work; the session carries the clerical weight.

---

## 4. Attention design

The operator works with gloves on, hands wet or sterile or full, under humidity, against the clock, among many near-identical containers. The experience is therefore designed around **attention, not navigation** — there is nothing to browse, only work to do.

**What should always be visible (or one glance away):** the identity of the object currently in hand, the single most likely next capture, and a quiet confirmation that the last capture was saved. These three answer the only questions the working hand has: *which one is this, what am I recording, did it stick.*

**What should almost never appear:** configuration, settings, historical depth, dense text to read, cross-object browsing, and anything resembling a notification or an alert. In the MVP the tool does not advise, warn, or nudge (PC-09; ADR-0002) — silence is a feature. A grow room full of pop-ups is a design failure.

**When information should surface:** exactly at the point of an action and only about the object in hand — this container's expected recipe reference, its last observation, its stage. It surfaces because it is relevant *now*, pulled by the action, not sought through menus.

**When it should disappear:** the instant the action is done. The tool returns to quiet and gives attention back to the biology. The default state of the interface is *absent*.

The heaviest single act in the whole experience is identifying the object in hand, and even that must be minimized (US-4: per-container identification friction is the risk that could break container-grain traceability). Every gesture must be forgiving of imprecision — the biology is unforgiving enough; the tool must not add to it.

---

## 5. Progressive complexity

The same architecture — one record, one anchor, one set of events — supports very different people by revealing complexity through **role and moment**, never through menus or settings.

- **New operator.** Sees few choices and the obvious next capture proposed for them; guardrails make the faithful path the easy path. Complexity is hidden until earned. The tool teaches by rhythm, not by manuals.
- **Experienced cultivator.** Feels speed and trust: minimal confirmation, the lightest gestures, no hand-holding. The tool assumes competence and gets out of the way faster.
- **Researcher.** Gains richer formulation context and the experimental flag, and can compare — but still lives in capture-first flow (Section 6). Extra depth appears only in research moments, never intruding on production work.
- **Founder / reviewer.** Sees the whole operation as evidence and derived state, with no capture pressure at all — an analytical, retrospective stance. Breadth appears in review, calm and complete.
- **Review mode.** Read-only and unhurried; the record is offered as a faithful account to be understood, not acted on.

Crucially, these are **stances**, not accounts — with one operator and one reviewer, the same person moves between them across a day. The underlying record is identical; only what is surfaced and how much is asked changes. Progressive complexity is a property of attention, not of the data, and so it never fragments the single memory.

---

## 6. Research experience

Research must feel **continuous** — the researcher should never sense that they have "switched to another system" — while the architectural boundary stays rigid (RECIPE_SIMULATOR_INTEGRATION; PC-08).

In experience terms, the researcher stays in one flow of thought: *"I want to try this formulation."* An approved or experimental formulation appears in-flow as a **choosable reference**, not as a separate application to open. When they deploy it to a real batch, ordinary capture simply continues, now carrying an experimental flag — the same gestures, the same rhythm, just marked. The formulation reasoning happens inside the Recipe & Formulation Engine, but to the researcher it feels like a natural continuation of their own intent, because only a light, versioned reference crosses into Field OS.

The seam is **invisible to feeling but rigid in fact**: experientially seamless, architecturally absolute. Field OS never computes or edits a formulation; the researcher never "leaves" to fetch one. The experimental flag quietly keeps this exploration from contaminating production baselines, so the researcher can experiment freely without fear of muddying the operational record. Continuity of feeling and separation of authority are not in tension here — the reference is precisely the thin bridge that delivers both.

---

## 7. Daily narrative

Morning in Tenjo, 2600 metres, the air cool and thin. The operator arrives at the laboratory, and the day opens without ceremony — they signal that lab work is beginning, and from then on the tool quietly knows who is working and when, and asks nothing more about it.

In the still-air box, agar and spawn work demands their whole hands and full sterility. Here the tool is almost absent; a capture waits for a clean moment and then takes a single light gesture — this container exists now, prepared to this recipe reference — and falls silent. Nothing pulls their attention off technique.

They move to incubation and glance along rows of colonizing containers. Where one diverges, they note an observation against that single container; the tool shows its short history so the eye can compare, then lets it go. No browsing, no searching — the object in hand summons only its own past.

Into the fruiting rooms, humidity high, gloves on. This is the observation round: condition after condition recorded against object after object, each capture the lightest possible mark, each confirmed and gone. When fruit is ready the tempo jumps to a harvest burst — hands full, picking fast — and the tool accepts outcomes at the speed of the pick, including the disposal of a failed block, recorded with the same standing as a success.

Midway, an interruption: contamination found in a corner. They flag it against its container and keep moving; no decision is forced, no alarm sounds — the flag simply waits for later interpretation. A phone call takes them away entirely; when they return, there is nothing to rebuild, because every mark they made is already safe. The abandoned session cost nothing.

By late afternoon the physical work winds down and they simply stop; there is no session to "close," because the record was never held hostage to one. In the evening — or remotely, from elsewhere — the reviewer reads the day as a single coherent account: what was created, observed, harvested, disposed, and flagged, each thing tied to its container, its recipe, its moment, its author. From that account they ready the day's evidence for the Knowledge System to evaluate — never pushing it in automatically, only preparing it.

Across the whole day, documentation never once interrupted cultivation. The operator worked; Field OS remembered. They leave confident that nothing was lost and that tomorrow the record will still be there, exactly as it happened.

---

## 8. Product principles

A small set of enduring experience principles, each grounded in the approved architecture.

- **Capture once; never ask twice.** Attribution, mode, and context carry through a session so the operator states a thing only when it first becomes true. *(PC-05; sessions organize, events persist.)*
- **The operator works; Field OS remembers.** The human keeps their attention on the biology; the tool holds the memory. *(PC-12, PC-11.)*
- **History never disappears.** A captured fact is permanent; a mistake is fixed by a new fact, never by loss. *(PC-11, INV-3.)*
- **Reference, never duplicate.** The operator never re-enters what another system owns — a recipe is chosen, not retyped. *(PC-07, PC-08.)*
- **Reduce thinking; confirm reality.** The tool proposes the obvious next capture; the operator confirms what is real. It lightens cognition but never decides. *(PC-05, PC-09, PC-12.)*
- **Preserve confidence.** Because nothing is ever lost and interruptions are free, the operator can move fast without fear. *(INV-3.)*
- **The interface is a guest in the grow room.** It appears at the point of work and leaves; its default state is absent. *(Attention design; PC-05.)*
- **Evidence, never advice.** In the MVP the tool records reality and, at most, shows it back; it never tells the operator what to do. *(PC-09; ADR-0002.)*
- **Every gesture is forgiving.** The biology is unforgiving enough; the tool never adds friction or punishes imprecision. *(Reliability; US-2, US-4.)*

---

## 9. Experience invariants

Properties that must survive every future interface redesign, for the lifetime of the platform. They are the experience-level expression of the architecture's invariants, and no visual redesign may break them.

- **Capture is always faster than the note-taking it replaces** — or the record dies (US-2). Speed of capture is a permanent, non-negotiable property, not a nice-to-have.
- **The operator never loses work to an interruption.** Every captured fact persists the instant it is made; there is never a half-saved state to lose (INV-3).
- **The tool never demands attention the biology did not.** No nagging, no alerts that serve the system rather than the work; the biology sets the agenda (CANON P-08; PC-09).
- **Identifying the object in hand is the heaviest act, and is always minimal.** Per-container identity is essential (INV-1) and must always be as light as possible (US-4).
- **The record always reads back as a faithful account.** The reviewer can always understand what happened from the record alone (PC-12; US-3).
- **The tool never decides.** It records and, at most, presents evidence; judgment stays with the operator (PC-12; PC-09).
- **Sessions never persist; only events do.** The interaction layer can be redesigned freely because it holds no history — the memory is untouched by any UI change (FIELD_OS_MVP_ARCHITECTURE §4; INV-4).
- **Reference never becomes duplication.** The operator never re-enters what a neighbouring system owns; the boundary is felt as convenience, not as a wall (PC-08).

These invariants are why the interface can be reimagined many times over the platform's life without ever changing what it *feels like* to work with Field OS: a quiet companion that remembers, so cultivation can stay the whole of the work.

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product experience*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, USER_WORKFLOWS.md, SYSTEM_INTERACTIONS.md, RECIPE_SIMULATOR_INTEGRATION.md, FIELD_OS_MVP_ARCHITECTURE.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*Defines the operational experience the future interface must embody. No screens, navigation, menus, UI, frameworks, or implementation. Faithful to every architectural invariant.*
*Field OS should feel like a quiet companion. Never an ERP. Never a form-filling application.*
