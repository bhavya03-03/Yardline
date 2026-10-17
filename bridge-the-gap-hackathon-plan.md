# Bridge the Gap — Hackathon Plan

**Research date:** 17 October 2026 · **Status:** Research and planning; no implementation code

## The current direction in two minutes

**Focus:** Seaports, cargo handling, and the administrative handoffs around them.

**The strongest problem:** A handling team and an office can describe the same cargo in incompatible ways. “Three pallets received” does not answer whether “24 cartons expected” actually arrived.

**Current recommendation: TallyBridge.** Turn a field tally into a comparable, evidence-linked administrative record, then send a precise recheck back to the person who can perform it.

1. Office records the expected quantity and source document.
2. Handler records actual groups, units, and whether the count is complete.
3. The tool compares only compatible quantities; different units or incomplete counts remain unresolved.
4. A discrepancy becomes an assigned recheck, with a response and human review.
5. Changed counts or documents require a fresh review.

**Why it fits the hackathon:** The bridge is visible, testable, and independent of live port APIs. A small working demonstration can connect physical observations with an administrative next action.

**The strongest challenge:** Terminal and warehouse systems may already do this. A real product needs a specific operator whose handoff is poorly served; that gap has not yet been validated.

### Three concepts to investigate

| Concept | The specific bridge | Main risk |
|---|---|---|
| **TallyBridge** | Field counts ↔ a reviewed administrative quantity and recheck | Existing systems may already cover the workflow |
| **HoldRelay** | A blocked case ↔ an accepted corrective action and verification | Could become an ordinary exception ticket |
| **DepotDelta** | A changed empty-return instruction ↔ dispatcher/driver acknowledgement | Needs an authoritative instruction source |

### Read the current port study

- [Twelve concrete problems](#173-twelve-concrete-problem-opportunities) and [ranked comparison](#174-ranked-shortlist).
- [Three concepts and their different mechanisms](#175-top-three-concepts-and-alternative-mechanisms).
- [Recommended product, MVP, journey, and technical scope](#176-recommendation-build-tallybridge-subject-to-one-local-validation-gate).
- [Both round plans](#177-plans-for-the-two-rounds), [three-minute demo](#178-three-minute-demonstration), and [30-second pitch](#179-thirty-second-pitch).
- [Judge questions](#1710-questions-a-skeptical-judge-should-ask), [risks](#1711-risks-judging-outlook-and-exclusions), and [sources](#1712-port-research-sources-and-limits).

> **Earlier research is retained below.** Sections 1–16 explore other domains and contain the earlier PointBack recommendation. For the port/cargo direction, use section 17 and the links above. All port scenarios and opportunity scores remain hypotheses or judgments until validated locally.

## Contents

**Current study:** [17. Ports, handling, and administrative handoffs](#17-current-direction-ports-cargo-handling-and-administrative-handoffs).

**Earlier broad exploration:**

1. [Assumptions and evidence](#1-assumptions-and-evidence-discipline)
2. [Understanding the gap](#2-what-kind-of-gap-are-we-bridging)
3. [Sixteen problem opportunities](#3-sixteen-problem-opportunities)
4. [Scoring and shortlist](#4-weighted-ranking-and-shortlist)
5. [Existing solutions](#5-existing-solutions-and-genuine-residual-gaps)
6. [Fifteen bridge mechanisms](#6-fifteen-substantially-different-bridge-mechanisms)
7. [Unconventional opportunities](#7-unconventional-opportunities-worth-retaining)
8. [Skeptical review and selection](#8-skeptical-review-and-final-selection)
9. [PointBack: the recommended product](#9-recommended-product-pointback)
10. [MVP, journey, and architecture](#10-smallest-credible-mvp)
11. [Round 1: five hours](#11-round-1-five-hours-to-earn-selection)
12. [Round 2: 12–15 hours](#12-round-2-implementation-in-an-additional-1215-hours)
13. [Demo and pitch](#13-three-minute-live-demonstration)
14. [Judge questions, risks, and exclusions](#14-judge-evaluation-defensible-answers-and-risk-review)
15. [Final decision sheet](#15-final-decision-sheet)
16. [Sources](#16-sources-and-research-limitations)

---

## 1. Assumptions and evidence discipline

### Working assumptions

- Three students, with two able to build basic web interfaces and one sharing research, content, testing, and presentation duties. Two-person teams should choose the single-device version immediately.

- Existing laptops, one phone or tablet, basic browser access, and a free static hosting option. No special hardware or paid API is necessary.

- No established relationship with a government department, hospital, school system, or equipment vendor.

- The campus setting is an accessible place to investigate, not a claim that this particular campus has the problem.

- English-reading users form the initial test population. Additional languages require reviewed content and are outside the first MVP.

- Round 1 permits a small prototype but does not require a polished application. Its exact rubric is unknown; the weights below are our decision aid, not the official rubric.

- The name PointBack is provisional. No trademark or domain availability search has been performed.

**AAC** means *augmentative and alternative communication*: ways to communicate alongside or instead of speech, including text, symbols, gestures, and communication devices.

### Evidence labels used throughout

- **[E] Evidence:** A public source was retrieved and supports the specific statement. Sources are listed as [S1](#s1)–[S19](#s19). A vendor page establishes advertised functionality, not independent effectiveness.

- **[H] Hypothesis:** Plausible interpretation or user need requiring local validation.

- **[J] Judgment:** Our comparative estimate, proposed design, score, or time allocation.

- **[T] Target:** A future test criterion, not an achieved result.

**Research boundary:** Targeted public-page research was possible; live interviews, field observations, competitor trials, and a systematic literature review were not conducted. Every scenario below is illustrative. No measured local prevalence, interview quotation, time saving, or user satisfaction result is claimed. Reach and frequency scores are estimates, not population statistics.

Do not present a role-play by speaking teammates as disability validation. It can test interface operation, not establish accessibility or user acceptance.

---

## 2. What kind of gap are we bridging?

A gap is a failed transfer at a boundary. Identify **sender, recipient, transferable thing, failure point, and desired next action** before proposing an interface.

| Failure type | What is missing? | Useful intervention | Common wrong intervention |
|---|---|---|---|
| **C — Cannot communicate** | An accessible channel or expression method | Text, symbols, pointing, asynchronous response, compatible formats | More instructions delivered through the same inaccessible channel |
| **U — Communicate, cannot understand** | Shared meaning or reference frame | Plain language, examples, visual references, recipient read-back | Literal transcription that preserves the ambiguity |
| **A — Understand, cannot act together** | Agreement, authority, sequencing, or acknowledgement | Explicit responsibilities, accepted next actions, revision handling | Another conversation without a decision |
| **R — Need and resource remain disconnected** | Discoverability, eligibility, fit, availability, or trust | Constraint checking and a completed handoff | A listing that leaves suitability and fulfilment unresolved |
| **T — Capability cannot transfer environments** | A usable representation or interface in the destination | Guided conversion, annotated evidence, accessible controls | Assuming that ability in one setting implies ability in another |

These can coexist. A text channel can fix C while leaving U and A untouched. A directory can reveal a resource while leaving R unresolved because it is incompatible, unavailable, or inaccessible. A correct explanation can still leave someone without authority to act.

### Applying all five distinctions to the twelve categories

Each category below shows five different ways an interaction can fail. The category alone does not tell us which intervention to use.

#### Communication

- **Communication:** Non-speaking customer cannot answer an oral question
- **Understanding:** “Reset” has different meanings to staff and customer
- **Joint action:** Both understand a request but do not confirm the accepted scope
- **Need and resource:** No interpreter for a service encounter
- **Transfer between environments:** Prepared AAC phrases do not fit a novel transaction

#### Knowledge/expertise

- **Communication:** Novice cannot describe an unfamiliar component
- **Understanding:** Expert's “left side” uses another viewpoint
- **Joint action:** Novice understands but needs expert sign-off
- **Need and resource:** Expertise exists in another department
- **Transfer between environments:** A demonstrated movement becomes an unusable written instruction

#### Accessibility

- **Communication:** Spoken-only service excludes a non-speaking or Deaf participant
- **Understanding:** Complex choices are not made comprehensible
- **Joint action:** An accommodation request never becomes an assigned task
- **Need and resource:** Accessible room exists but cannot be located or booked
- **Transfer between environments:** Someone can use their own device but not a kiosk

#### Resources/opportunity

- **Communication:** Borrower and provider have no contact channel
- **Understanding:** Their labels describe different equipment
- **Joint action:** A match exists but collection is unarranged
- **Need and resource:** Available equipment lacks the required adapter
- **Transfer between environments:** A booked resource cannot accomplish the task on site

#### Digital–physical

- **Communication:** An observed physical fault has no reporting route
- **Understanding:** A description does not identify the damaged part
- **Joint action:** Digital assignment lacks site access permission
- **Need and resource:** Spare part exists but is not linked to the fault
- **Transfer between environments:** A paper measurement loses units during digital entry

#### Information/context

- **Communication:** Relevant context is absent from the handoff
- **Understanding:** A rejection code is unintelligible to its recipient
- **Joint action:** Findings do not specify who acts next
- **Need and resource:** Evidence exists in another record
- **Transfer between environments:** An expert's notes cannot become a novice's actions

#### Social/cultural

- **Communication:** Someone cannot safely express disagreement
- **Understanding:** Silence is mistaken for agreement
- **Joint action:** Expectations about responsibility conflict
- **Need and resource:** Support exists outside the person's social network
- **Transfer between environments:** Home experience is disregarded in a formal workplace

#### Institutional

- **Communication:** Office contact is inaccessible
- **Understanding:** “Attested copy” is unclear
- **Joint action:** No one owns an exceptional case
- **Need and resource:** Applicant cannot find an accepting service
- **Transfer between environments:** A physical document is unusable in the portal

#### Collaboration

- **Communication:** Teammates lack a common channel
- **Understanding:** “Done” means different things
- **Joint action:** No owner accepts the next step
- **Need and resource:** Useful skills are hidden in another team
- **Transfer between environments:** Work in a design tool cannot become an actionable engineering task

#### Capability

- **Communication:** Person cannot specify the desired outcome
- **Understanding:** Interface asks for implementation choices they do not know
- **Joint action:** An intention needs authorized assistance
- **Need and resource:** A capable helper cannot be reached
- **Transfer between environments:** User can explain an outcome orally but cannot operate the form

#### Generational

- **Communication:** Preferred communication modes differ
- **Understanding:** Experience is expressed in unfamiliar terms
- **Joint action:** Family help lacks clear boundaries
- **Need and resource:** Experienced maker and novice never meet
- **Transfer between environments:** Tacit craft skill is lost in a written manual

#### Human–technology

- **Communication:** Tool rejects the user's input method
- **Understanding:** System state is opaque
- **Joint action:** User knows the goal but cannot recover from an error
- **Need and resource:** Appropriate built-in feature is undiscoverable
- **Transfer between environments:** A usable personal workflow fails in a mandatory shared system

**Design implication:** Ask “what becomes possible after this interaction?” A bridge should deliver an understood request, a usable resource, an accepted action, or a transferable capability—not merely an answer or a screen of information.

---

## 3. Sixteen problem opportunities

All local scenarios and unmet-need claims in this section are **[H]** unless a source is attached. “Alternatives fall short” means a specific boundary remains possible, not that all existing products lack the feature.

### P01. A non-speaking student cannot complete a two-way campus IT desk conversation

- **Who:** A student who cannot reliably use speech but can read and select or type; IT counter staff; optionally a chosen supporter.

- **Two sides:** The student's request and constraints ↔ the staff member's interpretation and proposed next action. **C/U/A.**

- **Scenario:** The student reports a laptop login problem and says their project files must remain. Staff orally proposes a reset; the student cannot easily check what “reset” means or correct the plan.

- **Cause:** Service conversations assume fast spoken turn-taking and treat receiving a request as agreeing on its meaning.

- **Current handling:** AAC, typed notes, paper, messaging, or a supporter. AAC supports multiple expression methods [E, S1–S3].

- **What still fails:** Expression tools do not by themselves ensure staff return a written plan and let the student correct it. A careful paper exchange can already do this.

- **Consequence:** Possible misunderstanding, dependence on a companion, abandoned service, or an unwanted proposed action. Actual local frequency is unknown.

- **Opportunity:** Make both the request and staff response visible and explicitly checked before the conversation ends.

- **How software helps:** A small shared interface can preserve constraints and track which version both parties reviewed. AI is unnecessary.

- **Validate first:** Intended users find the added structure more useful than their established AAC plus ordinary writing, and staff will participate.

### P02. A rejected administrative submission does not become an actionable correction

- **Who:** Students applying for a campus reimbursement or scholarship; counter staff; reviewing office.

- **Two sides:** Institutional requirement/rejection reason ↔ applicant's next document and return visit. **U/A/T.**

- **Scenario:** “Bank proof invalid” leaves a student unsure whether the issue is name, account ownership, date, or document type.

- **Cause:** Internal decision codes and policy language are not a usable correction plan; exceptions lack an owner.

- **Current handling:** Email, visits, published checklists, PDF notices, conditional forms, document wallets [E, S7–S10].

- **What still fails:** Document access and dynamic questions do not establish what this office will accept for this particular rejection. Well-designed services already provide helpful errors.

- **Consequence:** Repeat visits, missed deadlines, and staff rework; local scale unverified.

- **Opportunity:** Staff-issued correction receipt linking the exact issue, accepted evidence, contact, and next step.

- **How software helps:** Versioned, office-approved reason templates and a return-ready packet; no invented eligibility rules.

- **Validate first:** A reachable office will supply authoritative examples and actually use the receipt.

### P03. Repair customer and technician appear to agree but mean different work

- **Who:** Device owner, independent repair technician, front-desk intermediary.

- **Two sides:** Customer's outcome/budget/data constraints ↔ technician's diagnostic and repair scope. **U/A.**

- **Scenario:** “Make it work” is taken as permission for a factory reset although files matter more than restoring the device immediately.

- **Cause:** Outcomes, uncertainty, exclusions, and later scope changes are not always represented together.

- **Current handling:** Job sheets, calls, messages, estimates, customer portals. RepairShopr advertises estimates, portals, intake, tickets, and attachments [E, S11].

- **What still fails:** A priced estimate can still be unclear to a customer, but products may already support detailed approvals; do not claim otherwise.

- **Consequence:** Disputes, repeat calls, unwanted work, possible data loss.

- **Opportunity:** Plain-language scope and exclusions with revision-specific acknowledgement.

- **How software helps:** A structured shared job card, not AI repair diagnosis.

- **Validate first:** This improves on configuring an existing repair-management product or using a better paper intake sheet.

### P04. An expert's physical instruction has no shared reference frame for the novice

- **Who:** Student makers or technicians and novices learning a non-hazardous assembly task.

- **Two sides:** Expert's spatial/tacit knowledge ↔ novice's view of the object. **U/T/A.**

- **Scenario:** “Clip this to the back-left slot” is ambiguous when the learner views a cardboard exhibition model from the opposite side.

- **Cause:** Expert and novice reference different viewpoints; manuals assume component vocabulary.

- **Current handling:** In-person demonstration, video calls, annotated photos, manuals, digital procedures. Visual and procedural tools already exist [E, S14–S15].

- **What still fails:** An instruction is not evidence that the learner selected the intended part. The proposed improvement is an explicit point-and-confirm exchange.

- **Consequence:** Rework and dependence on repeated demonstrations. Safety-critical applications would carry much greater risk and are excluded.

- **Opportunity:** Expert marks a reference image; novice points to the matching part on their own image; expert confirms or corrects.

- **How software helps:** Photo annotation and a tiny review workflow; no general computer vision.

- **Validate first:** The extra exchange prevents enough ambiguity to outperform a video call or existing annotation tool.

### P05. A resource is available to borrow but does not form a usable kit

- **Who:** Student borrowing a camera or microphone; campus equipment librarian; event team.

- **Two sides:** Intended task and device constraints ↔ inventory and compatible combinations. **R/U/T.**

- **Scenario:** A microphone is available but its connector does not work with the borrower's phone without another adapter.

- **Cause:** Inventory is often understood as individual items; the user needs a functioning chain of components.

- **Current handling:** Staff advice, prepacked kits, booking platforms. Shelf, Cheqroom, and myTurn already support substantial equipment workflows [E, S12–S13, S16].

- **What still fails:** Availability and bundling do not establish dynamic task compatibility in every implementation. Existing kit configuration may solve it adequately.

- **Consequence:** Failed recording, return trips, and apparently available resources being unusable.

- **Opportunity:** A small, curated constraint checker produces an explained, staff-verified kit.

- **How software helps:** Explicit compatibility rules over a tiny inventory, not an open marketplace.

- **Validate first:** Local equipment combinations are variable enough that a fixed kit and label are insufficient.

### P06. A cleaner sees a fault but cannot hand maintenance a repairable report

- **Who:** Cleaning staff, facilities dispatcher, maintenance worker, room occupant.

- **Two sides:** Situated observation ↔ triage information and access arrangements. **C/U/A/T.**

- **Scenario:** “The second tap leaks” lacks a stable fixture identifier, severity, and permission to enter the room.

- **Cause:** Observers do not share maintenance vocabulary or asset references.

- **Current handling:** Calls, WhatsApp photos, QR work requests, facilities systems, inspection tools [E for checklist tools, S14].

- **What still fails:** Free-text reports can omit context; established work-order systems may already resolve this with location codes and required fields.

- **Consequence:** Follow-up calls, delayed repair, duplicated work.

- **Opportunity:** Photo-and-location evidence turned into a maintenance-accepted task with one clarification loop.

- **How software helps:** Guided capture, stable room/fixture labels, and acceptance status.

- **Validate first:** Missing reporting structure, rather than maintenance capacity, causes the delay.

### P07. A teacher's translated notice still does not tell a family what to do

- **Who:** Teacher, caregiver who uses another language or has limited institutional familiarity, student.

- **Two sides:** School notice ↔ caregiver's understood action and constraints. **U/A.**

- **Scenario:** A family can read a translated excursion notice but cannot identify the deadline, payment alternative, or permission requirement.

- **Cause:** Translation preserves implicit school context; acknowledgement is mistaken for ability to comply.

- **Current handling:** Translated messages, school portals, calls, bilingual staff. These are established workflow types; no specific product deficiency is asserted.

- **What still fails:** A translated paragraph need not expose required actions or provide an easy “I need help with payment” response.

- **Consequence:** Missed participation and repeated staff follow-up.

- **Opportunity:** Reviewed action cards and private replies specifying the barrier.

- **How software helps:** Structured extraction with teacher approval; a manual template is the fallback.

- **Validate first:** Families prefer a new interaction to improved messages through their current channel.

### P08. Workers can agree to swap shifts but the replacement is not valid

- **Who:** Hourly workers, scheduler, workers with transport or accessibility constraints.
- **Two sides:** Personal availability ↔ role qualifications and institutional scheduling rules. **A/R.**
- **Scenario:** Two workers arrange a swap, then discover one lacks required training or cannot reach the location at that hour.
- **Cause:** Informal negotiation and roster eligibility are separate.
- **Current handling:** Group chats, manager approval, scheduling platforms.
- **What still fails:** Chat does not check constraints; existing workforce platforms may already support qualification-aware swaps.
- **Consequence:** Invalid swaps, lost income, uncovered work.
- **Opportunity:** Explain why a proposed swap is feasible and route the precise exception to a manager.
- **How software helps:** Rules and explicit approvals, not a recommendation feed.
- **Validate first:** Reliable qualifications and availability can be obtained without a real employer integration.

### P09. A tenant's intermittent observation never becomes a reproducible fault

- **Who:** Tenant, landlord or housing office, repair worker.

- **Two sides:** Time-specific lived observation ↔ evidence needed to investigate. **U/A/T.**

- **Scenario:** A window leaks only during wind-driven rain; the repair worker visits on a dry day.

- **Cause:** The evidence and the repair encounter occur at different times and use different descriptions.

- **Current handling:** Photos, calls, emails, property-management tickets.

- **What still fails:** Media without time, location, conditions, or previous action may not help reproduce the issue; structured tickets can already capture these.

- **Consequence:** Repeat visits and unresolved defects.

- **Opportunity:** A compact condition-and-evidence handoff with technician clarification.

- **How software helps:** Guided timeline, annotated photo, and an explicit question back to the tenant.

- **Validate first:** Better evidence changes repair outcomes rather than exposing an unwillingness or capacity problem software cannot solve.

### P10. A first-generation student cannot turn confusion into a useful office-hours request

- **Who:** Student unfamiliar with university conventions, teacher or teaching assistant.

- **Two sides:** Student's partial understanding ↔ instructor's ability to diagnose the sticking point. **U/R/A.**

- **Scenario:** “I don't understand any of it” does not reveal that the student cannot interpret an assignment's expected output.

- **Cause:** Asking for help itself requires tacit knowledge about acceptable questions and evidence.

- **Current handling:** Email, peer mentors, tutoring, forums, office hours.

- **What still fails:** Availability of help does not make it easy to express what has been tried; a thoughtful email template may be sufficient.

- **Consequence:** Avoided help and inefficient conversations.

- **Opportunity:** A student-owned “attempt / stuck point / question” packet with a teacher-selected next step.

- **How software helps:** Prompted structure and attachment, not answer generation.

- **Validate first:** A template reduces anxiety and improves access rather than adding homework before help.

### P11. A donation is available but cannot be used by the intended recipient

- **Who:** Community coordinator, donor, recipient, delivery volunteer.
- **Two sides:** Specific need and practical constraints ↔ a donated object's dimensions, condition, location, and availability. **R/A.**
- **Scenario:** A donated desk cannot fit the recipient's doorway and no transport is available.
- **Cause:** “Match” often describes item category, not successful fulfilment.
- **Current handling:** Community groups, charity staff, local marketplaces, spreadsheets.
- **What still fails:** A listing or message does not resolve transport and fit; experienced coordinators may already manage these well.
- **Consequence:** Failed collections and unusable donations.
- **Opportunity:** A fulfilment-ready handoff checking size, pickup, transport, and recipient acceptance.
- **How software helps:** Constraint checklist and explicit responsibility for collection.
- **Validate first:** The limiting resource is coordination rather than transport funding or insufficient supply.

### P12. A Deaf participant receives captions but misses the group's settled decision

- **Who:** Deaf or hard-of-hearing participant, meeting chair, teammates.
- **Two sides:** Fast, overlapping discussion ↔ accepted decisions, ownership, and dissent. **C/U/A.**
- **Scenario:** Captions include several contradictory dates but do not show which date the group finally accepted.
- **Cause:** Transcription and group commitment are different operations.
- **Current handling:** Captions, interpreters, chat, minutes, collaborative documents.
- **What still fails:** A transcript alone is not an agreed decision; a competent chair and shared notes may already solve this.
- **Consequence:** Exclusion from decisions or incorrect action.
- **Opportunity:** Participant-controlled decision cards that require visible confirmation, including a “not agreed” state.
- **How software helps:** Explicit human-authored decision capture, with captions only as an optional external input.
- **Validate first:** Participants will pause and confirm rather than treat the tool as extra meeting administration.

### P13. An older adult needs help with one action but must expose an entire account

- **Who:** Older adult, trusted family helper, service provider.
- **Two sides:** Limited assistance need ↔ helper's available authority. **A/T.**
- **Scenario:** A relative only needs to help update a postal address, but the service provides full account access or no help.
- **Cause:** Account permissions are too coarse for the real relationship.
- **Current handling:** Screen sharing, in-person help, formal delegates where available, unsafe credential sharing.
- **What still fails:** Guidance cannot create delegated authority in an external system that lacks it.
- **Consequence:** Loss of autonomy and privacy, possible account misuse.
- **Opportunity:** Narrowly scoped delegated action with owner confirmation.
- **How software helps:** Provider-side authorization design; a browser overlay cannot reliably manufacture this authority.
- **Validate first:** A real service will integrate. Too dependent on institutional/security work for this hackathon.

### P14. A local tradesperson and supplier cannot reliably identify the same part

- **Who:** Repair worker, shop owner, wholesaler, end customer.

- **Two sides:** Visual/local-name description ↔ supplier SKU and compatibility specification. **U/R/T.**

- **Scenario:** A requested “small elbow connector” comes in different diameters and thread standards.

- **Cause:** Informal terminology lacks the dimensions that determine fit.

- **Current handling:** Carrying the old part, photos, calls, catalogues, experienced staff.

- **What still fails:** A photograph need not establish dimensions or thread type; professional catalogues may solve identification for trained users.

- **Consequence:** Wrong purchases and return trips.

- **Opportunity:** Supplier-guided measurement questions yielding a mutually checked specification.

- **How software helps:** A tiny curated category tree with required dimensions. General visual recognition is risky.

- **Validate first:** Accurate local catalogues and a knowledgeable reviewer can be obtained quickly.

### P15. A caregiver receives new instructions without knowing which version supersedes the old one

- **Who:** Patient, family caregivers, clinician or care coordinator.

- **Two sides:** Updated care instruction ↔ multiple carers' current understanding and responsibilities. **U/A.**

- **Scenario:** A paper instruction changes after a visit but an absent carer follows the previous version.

- **Cause:** Version, authority, and acknowledgement are fragmented across channels.

- **Current handling:** Paper plans, portals, calls, family chats, clinical handover workflows.

- **What still fails:** Delivery is not acknowledgement; however, reliable interpretation needs the issuing professional. Teach-back is already an established clinical method [E, S6].

- **Consequence:** Potentially serious care errors.

- **Opportunity:** Professional-issued revision and acknowledged responsibilities.

- **How software helps:** Document versioning and read-back; no automated medical interpretation.

- **Validate first:** Authorized clinical participation and safe operational procedures are available. Exclude from the recommended MVP.

### P16. Teammates share a task title but not a definition of completion

- **Who:** Student designer, developer, presenter, project coordinator.
- **Two sides:** Expectations encoded in different tools ↔ accepted deliverable and handoff. **U/A/T.**
- **Scenario:** “Login finished” means a polished mockup to one person and a working authentication flow to another.
- **Cause:** Shared labels hide different acceptance criteria.
- **Current handling:** Issue trackers, task templates, chat, stand-ups, acceptance criteria.
- **What still fails:** Teams can leave criteria unwritten, but established tools already support them.
- **Consequence:** Last-minute rework and conflicting expectations.
- **Opportunity:** A lightweight mutual acceptance step with an example of what “done” means.
- **How software helps:** A structured task agreement embedded in existing work.
- **Validate first:** A new tool beats simply using existing task templates properly. Weak differentiation.

---

## 4. Weighted ranking and shortlist

### Method

All numeric assessments are **[J]**, informed by available **[E]** where noted. A 10 means favorable for selecting a hackathon opportunity. Thus “alternatives” means **weakness of current alternatives**: a low score means strong competition. Frequency refers to recurrence in the target workflow, not how frequently every person in society experiences the issue. Reach refers to plausible breadth, not a verified market size.

**Weighted score / 100 = sum(score × criterion weight) / 10.** No criterion is a measured empirical statistic.

| Code | Criterion | Weight | Reason |
|---|---|---:|---|
| S | Severity | 10 | A compelling bridge must address meaningful consequences |
| F | Frequency | 6 | Repeated friction supports return use, but rare serious problems matter |
| N | Number affected | 4 | Avoid allowing large markets to overwhelm underserved needs |
| C | Importance of connection | 10 | The boundary must be central to the problem |
| W | Weakness of alternatives | 6 | Existing adequate workflows reduce the reason to build |
| B | Bridge the Gap alignment | 10 | Theme relevance must be immediately demonstrable |
| D | Differentiation potential | 10 | A generic interface is unlikely to stand out |
| H | Feasibility in 12–15 hours | 12 | A working central mechanism is essential |
| I | Data/integration availability | 7 | Unavailable inputs can invalidate an otherwise easy build |
| M | Demonstration quality | 10 | Judges must see the improvement in three minutes |
| P | Real-world impact | 8 | Benefits must extend beyond a staged UI interaction |
| R | Reliability when vibe-coded | 7 | Deterministic, narrow workflows are preferable to fragile pipelines |
| | **Total** | **100** | |

Severity is the harm of an individual failure; impact estimates the benefit achievable within realistic adoption. They are related, so neither gets an overwhelming weight. Feasibility concerns delivery time; reliability concerns behavior after delivery.

### Complete scoring matrix

#### Problem significance

| Problem | Severity | Frequency | Reach | Connection importance |
|---|---:|---:|---:|---:|
| [P01](#p01-a-non-speaking-student-cannot-complete-a-two-way-campus-it-desk-conversation) | 8 | 6 | 4 | 9 |
| [P04](#p04-an-experts-physical-instruction-has-no-shared-reference-frame-for-the-novice) | 7 | 6 | 6 | 9 |
| [P02](#p02-a-rejected-administrative-submission-does-not-become-an-actionable-correction) | 7 | 7 | 8 | 9 |
| [P03](#p03-repair-customer-and-technician-appear-to-agree-but-mean-different-work) | 8 | 6 | 8 | 9 |
| [P05](#p05-a-resource-is-available-to-borrow-but-does-not-form-a-usable-kit) | 6 | 6 | 6 | 8 |
| [P09](#p09-a-tenants-intermittent-observation-never-becomes-a-reproducible-fault) | 7 | 6 | 8 | 8 |
| [P12](#p12-a-deaf-participant-receives-captions-but-misses-the-groups-settled-decision) | 8 | 7 | 6 | 9 |
| [P06](#p06-a-cleaner-sees-a-fault-but-cannot-hand-maintenance-a-repairable-report) | 7 | 8 | 7 | 8 |
| [P10](#p10-a-first-generation-student-cannot-turn-confusion-into-a-useful-office-hours-request) | 6 | 6 | 7 | 8 |
| [P16](#p16-teammates-share-a-task-title-but-not-a-definition-of-completion) | 5 | 8 | 8 | 7 |
| [P07](#p07-a-teachers-translated-notice-still-does-not-tell-a-family-what-to-do) | 7 | 7 | 8 | 9 |
| [P15](#p15-a-caregiver-receives-new-instructions-without-knowing-which-version-supersedes-the-old-one) | 9 | 8 | 8 | 10 |
| [P11](#p11-a-donation-is-available-but-cannot-be-used-by-the-intended-recipient) | 8 | 6 | 7 | 9 |
| [P14](#p14-a-local-tradesperson-and-supplier-cannot-reliably-identify-the-same-part) | 7 | 8 | 7 | 9 |
| [P08](#p08-workers-can-agree-to-swap-shifts-but-the-replacement-is-not-valid) | 8 | 7 | 7 | 9 |
| [P13](#p13-an-older-adult-needs-help-with-one-action-but-must-expose-an-entire-account) | 8 | 7 | 8 | 10 |

#### Fit and buildability

| Problem | Weak alternatives | Theme fit | Differentiation | Feasibility |
|---|---:|---:|---:|---:|
| [P01](#p01-a-non-speaking-student-cannot-complete-a-two-way-campus-it-desk-conversation) | 5 | 10 | 6 | 9 |
| [P04](#p04-an-experts-physical-instruction-has-no-shared-reference-frame-for-the-novice) | 5 | 10 | 8 | 8 |
| [P02](#p02-a-rejected-administrative-submission-does-not-become-an-actionable-correction) | 5 | 9 | 6 | 9 |
| [P03](#p03-repair-customer-and-technician-appear-to-agree-but-mean-different-work) | 2 | 9 | 3 | 9 |
| [P05](#p05-a-resource-is-available-to-borrow-but-does-not-form-a-usable-kit) | 4 | 9 | 7 | 9 |
| [P09](#p09-a-tenants-intermittent-observation-never-becomes-a-reproducible-fault) | 4 | 8 | 5 | 9 |
| [P12](#p12-a-deaf-participant-receives-captions-but-misses-the-groups-settled-decision) | 4 | 10 | 6 | 7 |
| [P06](#p06-a-cleaner-sees-a-fault-but-cannot-hand-maintenance-a-repairable-report) | 3 | 8 | 4 | 9 |
| [P10](#p10-a-first-generation-student-cannot-turn-confusion-into-a-useful-office-hours-request) | 5 | 8 | 5 | 9 |
| [P16](#p16-teammates-share-a-task-title-but-not-a-definition-of-completion) | 2 | 8 | 4 | 10 |
| [P07](#p07-a-teachers-translated-notice-still-does-not-tell-a-family-what-to-do) | 4 | 9 | 4 | 8 |
| [P15](#p15-a-caregiver-receives-new-instructions-without-knowing-which-version-supersedes-the-old-one) | 4 | 9 | 5 | 5 |
| [P11](#p11-a-donation-is-available-but-cannot-be-used-by-the-intended-recipient) | 4 | 9 | 6 | 6 |
| [P14](#p14-a-local-tradesperson-and-supplier-cannot-reliably-identify-the-same-part) | 4 | 9 | 6 | 6 |
| [P08](#p08-workers-can-agree-to-swap-shifts-but-the-replacement-is-not-valid) | 4 | 8 | 6 | 6 |
| [P13](#p13-an-older-adult-needs-help-with-one-action-but-must-expose-an-entire-account) | 5 | 10 | 7 | 4 |

#### Delivery and total score

| Problem | Data access | Demo | Impact | Reliability | Total /100 |
|---|---:|---:|---:|---:|---:|
| [P01](#p01-a-non-speaking-student-cannot-complete-a-two-way-campus-it-desk-conversation) | 9 | 10 | 8 | 9 | **81.0** |
| [P04](#p04-an-experts-physical-instruction-has-no-shared-reference-frame-for-the-novice) | 8 | 10 | 8 | 8 | **80.2** |
| [P02](#p02-a-rejected-administrative-submission-does-not-become-an-actionable-correction) | 7 | 9 | 8 | 9 | **78.8** |
| [P03](#p03-repair-customer-and-technician-appear-to-agree-but-mean-different-work) | 9 | 10 | 8 | 9 | **76.8** |
| [P05](#p05-a-resource-is-available-to-borrow-but-does-not-form-a-usable-kit) | 8 | 10 | 7 | 9 | **76.7** |
| [P09](#p09-a-tenants-intermittent-observation-never-becomes-a-reproducible-fault) | 8 | 9 | 8 | 9 | **75.3** |
| [P12](#p12-a-deaf-participant-receives-captions-but-misses-the-groups-settled-decision) | 6 | 9 | 8 | 7 | **74.9** |
| [P06](#p06-a-cleaner-sees-a-fault-but-cannot-hand-maintenance-a-repairable-report) | 8 | 8 | 8 | 9 | **73.5** |
| [P10](#p10-a-first-generation-student-cannot-turn-confusion-into-a-useful-office-hours-request) | 8 | 8 | 7 | 9 | **72.7** |
| [P16](#p16-teammates-share-a-task-title-but-not-a-definition-of-completion) | 10 | 8 | 6 | 10 | **72.0** |
| [P07](#p07-a-teachers-translated-notice-still-does-not-tell-a-family-what-to-do) | 6 | 8 | 8 | 7 | **71.9** |
| [P15](#p15-a-caregiver-receives-new-instructions-without-knowing-which-version-supersedes-the-old-one) | 4 | 8 | 9 | 5 | **70.9** |
| [P11](#p11-a-donation-is-available-but-cannot-be-used-by-the-intended-recipient) | 5 | 8 | 8 | 7 | **70.8** |
| [P14](#p14-a-local-tradesperson-and-supplier-cannot-reliably-identify-the-same-part) | 4 | 9 | 8 | 6 | **70.6** |
| [P08](#p08-workers-can-agree-to-swap-shifts-but-the-replacement-is-not-valid) | 5 | 8 | 8 | 7 | **70.4** |
| [P13](#p13-an-older-adult-needs-help-with-one-action-but-must-expose-an-entire-account) | 3 | 8 | 9 | 4 | **70.3** |

**What changed after alternative research:** P03 initially scored 79.4. Verified repair-management functionality reduced W from 3 to 2 and D from 5 to 3, lowering it to 76.8. The table shows the revised assessment. Established AAC and equipment-kit functionality also explain conservative differentiation/alternatives scores for P01 and P05.

**Uncertainty:** Treat differences below roughly three points as inconclusive. The scores are not precise enough to prove that 81.0 beats 80.2. A one-point change to both P01 feasibility and reliability lowers it by 1.9, putting P04 ahead. Increasing differentiation weight by five points and reducing feasibility weight by five also puts P04 ahead. Choose P01 because of its evidence-supported interaction pattern and smaller technical scope; validate the local need before commitment.

### Five problems retained

| Problem | Why investigate further? | Main reason it could still lose |
|---|---|---|
| P01: non-speaking student ↔ IT desk | Clear two-sided encounter; no AI dependency; expression plus staff reply is easy to show | Existing AAC and ordinary writing may be sufficient |
| P04: expert ↔ novice reference frame | Distinct physical/digital interaction; concrete correction moment | Extra image exchange may be slower than demonstration |
| P02: rejection ↔ corrective action | High institutional relevance; clear before/after | Requires authoritative institutional participation |
| P03: repair outcome ↔ scope | Immediate stakes and a reliable small workflow | Crowded software category and strong paper alternative |
| P05: borrower task ↔ compatible kit | Bridges usable access rather than listings | Fixed kits or existing equipment platforms may already solve it |

### Why the other eleven did not make the shortlist

| Problem | Specific limiting factor in this hackathon |
|---|---|
| P09 tenant faults | Ticketing overlap; improvement depends on repair willingness and site access |
| P12 meeting decisions | Important, but group adoption and participation fairness need richer testing |
| P06 maintenance | Mature work-order pattern; reporting may not be the real bottleneck |
| P10 office hours | An email template and a receptive teacher may deliver most of the benefit |
| P16 team completion | Strong existing acceptance-criteria workflows; low differentiation |
| P07 school notices | Reviewed translation and caregiver access are harder than text extraction |
| P15 care instructions | High consequences plus clinical authority and privacy requirements |
| P11 donations | Transport, trust, and supply constraints can dominate software coordination |
| P14 part identification | Reliable local specifications and catalogue data are hard to prepare |
| P08 shift swaps | Real eligibility rules and employer integrations are unavailable |
| P13 delegated help | External authorization cannot be safely simulated as a real capability |

---

## 5. Existing solutions and genuine residual gaps

This is a targeted alternative review, not a claim to have exhausted each market. “Unresolved” identifies what must be tested; it does not prove a competitor lacks every relevant configuration.

### P01: service-counter communication

#### Cboard [S2](#s2)

**How it works:** Browser AAC with symbols/text-to-speech; communicator composes an expression for a listener

**Works well for:** Accessible expression; an inspectable open-source implementation

**Remaining question:** A custom board may cover the whole encounter. Our advantage must be staff read-back and revision handling, not “AAC in a browser”

#### TD Snap [S3](#s3)

**How it works:** AAC page sets supporting symbols, text, and multiple access methods

**Works well for:** Mature, personalized communication approaches

**Remaining question:** Do not compete on vocabulary, motor access, or language development. A service workflow should complement the person's chosen AAC

#### Talking Mats [S4](#s4)

**How it works:** A visual framework: participant places options against a scale to express views; available physically and digitally

**Works well for:** Shared expression and deliberation

**Remaining question:** Already two-sided. Our narrowly transactional request/response acknowledgement differs in structure; superiority is unproven

#### Aphasia Institute SCA [S5](#s5)

**How it works:** Skills and tools for supported conversations, including revealing and verifying meaning

**Works well for:** Established communication-partner practice

**Remaining question:** Conceptually close. We borrow the general principle of checking meaning; do not claim to invent it or deliver clinical SCA

#### Communication Access UK [S17](#s17)

**How it works:** Communication-access standards, training, and a recognition scheme

**Works well for:** Changes service-provider behavior, not merely the user's tool

**Remaining question:** Software cannot substitute for respectful staff practice. Current signup availability must not be assumed

#### Paper or phone notes [workflow]

**How it works:** Customer writes; staff can write back, clarify, and keep a copy

**Works well for:** Cheap, flexible, offline, no product adoption

**Remaining question:** Strongest baseline. Digital value must be demonstrable constraint acknowledgement and invalidation of outdated confirmations

**Meaningful prospective advantage [H]:** A short desk-specific exchange where staff must acknowledge a named constraint, the student sees the proposed action in writing, and any later edit visibly requires another review. This is incremental workflow differentiation. It is not a claim of unique AAC technology or universal accessibility.

**Research check [E]:** Shrubsole, Power, and Hallé's systematic review of communication-partner-training implementation in aphasia identified contextual resources, skills, knowledge, and other implementation factors across 17 included studies [S19](#s19). This supports taking partner behavior and deployment context seriously. It does **not** establish that an IT-counter app works, that aphasia and non-speaking communication needs are interchangeable, or that every user needs this workflow. Only the indexed abstract was reviewed here.

### P04: expert-to-novice physical guidance

#### Microsoft Dynamics 365 Guides documentation [S15](#s15)

**How it works:** Describes author-created, location-tethered instruction cards with images/video/3D objects

**Works well for:** Linking procedural information to physical work

**Remaining question:** The documented system is much broader than a hackathon tool; its hardware and current product lifecycle must not be assumed suitable

#### SafetyCulture checklist guidance [S14](#s14)

**How it works:** Describes repeatable digital procedures and recorded inspection outcomes

**Works well for:** Standardization and evidence capture

**Remaining question:** A custom inspection may already include the desired check. Our narrow interaction is novice-selected counterpart reviewed by the expert

#### Annotated photos, video calls, printed diagrams [workflow]

**How it works:** Expert points, narrates, or labels while learner follows

**Works well for:** Extremely accessible existing methods

**Remaining question:** The new product must demonstrate reduced reference ambiguity, not just add arrows to images

#### AHRQ show-me method [S6](#s6)

**How it works:** Clinical guidance describes asking someone to demonstrate an instructed task

**Works well for:** Established principle that showing can expose misunderstandings

**Remaining question:** A precedent for the mechanism, not evidence of effectiveness in student assembly tasks

**Residual opportunity [H]:** Capture and correct the learner's interpretation, not just deliver the expert's view. No automated proof of correct assembly is proposed. Human expert review remains essential.

### P02: administrative correction handoff

#### DigiLocker [S7](#s7)

**How it works:** Access, storage/sharing, and verification of digital documents across issuers and recipients

**Works well for:** Availability and authenticity of supported documents

**Remaining question:** Does not by itself establish why a particular campus submission was rejected or what that office accepts next

#### Jotform conditional logic [S8](#s8)

**How it works:** Changes form behavior based on answers; can support structured intake

**Works well for:** Asking relevant questions and avoiding irrelevant fields

**Remaining question:** A configured form could implement much of the concept. Differentiation rests on office-issued correction and return handoff, not conditional logic

#### GOV.UK check-answers pattern [S9](#s9)

**How it works:** Applicant reviews and corrects answers before submission

**Works well for:** Error prevention and user control

**Remaining question:** Strong pattern to reuse; it is not a complete post-rejection resolution process

#### GOV.UK error summary [S10](#s10)

**How it works:** Gives an error summary and links to field errors

**Works well for:** Actionable in-form correction

**Remaining question:** If the existing service already does this well, build nothing. The target is an offline/institutional handoff that lacks it

#### Staff-written email/checklist [workflow]

**How it works:** Officer explains the reason and accepted evidence

**Works well for:** Authoritative, simple, already familiar

**Remaining question:** Our receipt only wins if it reduces ambiguity and repeated explanation with less staff work

**Residual opportunity [H]:** Translate an authorized decision into a return-ready action packet with provenance and an exception contact. Automatic policy interpretation is excluded.

### P03: repair scope agreement

#### RepairShopr [S11](#s11)

**How it works:** Advertises repair tickets, intake forms, estimates, customer portal, communication, and attachments

**Works well for:** The core customer/repair-shop workflow

**Remaining question:** Substantial overlap. Do not claim customer-facing estimates or repair communication are new

#### iFixit Answers [S18](#s18)

**How it works:** Community questions and replies about repair problems

**Works well for:** Exchanging repair knowledge and diagnostic suggestions

**Remaining question:** Does not itself mean a local technician has accepted a specific job scope; this is a different interaction

#### Itemized estimate plus phone/message [workflow]

**How it works:** Technician explains proposed work and seeks owner agreement

**Works well for:** Low-cost, familiar approval

**Remaining question:** Can already include exclusions. Better wording may be more valuable than a new app

**Residual opportunity [H]:** Make a single critical exclusion persistent and invalidate acknowledgement when scope changes. This is easy to demonstrate but weak as a standalone product unless users reveal a consistent unmet need.

### P05: usable equipment borrowing

#### Shelf [S12](#s12)

**How it works:** Advertises equipment inventory, bookings, custody, kits, and labels

**Works well for:** Equipment availability, accountability, grouped assets

**Remaining question:** Do not build another catalogue or claim kits are missing. Task-specific compatibility needs comparison with real configuration options

#### Cheqroom help center [S13](#s13)

**How it works:** Documents categories for kits/bulk items, bookings, checkouts, and access

**Works well for:** Established equipment-loan administration

**Remaining question:** Only category existence was verified; detailed compatibility behavior was not tested

#### myTurn [S16](#s16)

**How it works:** Lending and asset platform with reservations, check-in/out support, and reminders

**Works well for:** Completing a lending transaction

**Remaining question:** Verify whether configurable bundles or instructions already cover the local case

#### Fixed kit plus printed compatibility label [workflow]

**How it works:** Librarian supplies a known working package

**Works well for:** Very reliable and cheap

**Remaining question:** The best baseline. Dynamic software is unjustified when a few standard kits suffice

**Residual opportunity [H]:** Explain and verify a small number of nonstandard combinations from the borrower's desired outcome. A catalogue plus “AI recommendations” would not be enough.

---

## 6. Fifteen substantially different bridge mechanisms

All approaches below are **[J]**, not products already built. Difficulty assumes a narrow prototype: **low = 3–5 focused builder-hours; medium = 6–10; high = more than 10 or substantial external dependency.** These are core-mechanism estimates, excluding polish and testing. The full team plan appears later.

### P01: non-speaking student and campus IT desk

#### Approach 1A — Structured request, staff read-back, student confirmation.

- **How it connects the two sides:** Student and staff exchange a shared request card. Student selects or types the problem and constraints; staff returns the understood request and a proposed action; student corrects, confirms, or pauses.

- **Input, output, and why it works:** “Cannot sign in; keep files” → “Check account and keyboard; no erasure proposed.” It fixes missing return communication and acknowledgement rather than merely generating speech. It differs from 1B by structuring the transaction and from 1C by requiring the student's confirmation.

- **Build effort and risks:** Local web form plus a versioned state machine; **low–medium**. Main risks are overrestrictive phrases and superficial confirmation. Always allow free text, “not right,” and “I need a person to help.”

- **Smallest demo:** One shared device, one request, one conflicting response, one corrected response, one agreed receipt. Show an edit invalidating the previous confirmation. This is the recommended mechanism.

#### Approach 1B — A bidirectional written conversation surface.

- **How it connects the two sides:** Student and staff alternate between clearly labeled text panels on the same device; the current speaker controls the input. Each provides free text and receives a persistent written reply.

- **Why this approach is different:** Removes the spoken-only return channel. Unlike 1A, it does not impose service stages or extract constraints; unlike 1C, it needs little reusable content.

- **Build effort and risks:** Local transcript, keyboard/touch input, optional speech output; **low**. Slow typing and small screens remain barriers. A standard notes app may work equally well.

- **Smallest demo:** Three turns that end in a clear written plan. One device and exportable text suffice. Reject as the primary concept unless users explicitly prefer this simplicity; differentiation is weak.

#### Approach 1C — User-owned communication and service preference card.

- **How it connects the two sides:** Student prepares “Please write your reply; give me time; ask before changing my device” and shows it to staff. Staff chooses an appropriate response format and fills a simple action slip.

- **Input, output, and why it works:** User preferences → staff-facing instructions plus an accessible response. It addresses staff behavior before the encounter. Unlike 1A/1B, most effort happens once and reuse is central.

- **Build effort and risks:** Static card builder and printable/local card; **low**. Staff may ignore it; preferences can become outdated. Do not require a diagnosis or public profile.

- **Smallest demo:** Create a card, switch to the staff view, produce a written next step. Strong low-tech option, but a printed card may be the best implementation.

### P04: expert and novice physical reference frames

#### Approach 4A — Reciprocal photo pointing.

- **How it connects the two sides:** Expert marks a part on a reference photo; novice marks what they think is the same part on their own photo; expert approves or corrects it.

- **Input, output, and why it works:** Two images and selected points → a checked correspondence. Makes viewpoint disagreement visible instead of assuming a verbal label transferred. Unlike 4B it requires active learner interpretation; unlike 4C it needs no physical labels.

- **Build effort and risks:** Image upload, normalized image coordinates, review state; **medium**. Rotation, unclear photos, and mistaken expert confirmation remain. No automatic object matching.

- **Smallest demo:** Three cardboard-model parts; learner deliberately selects the wrong clip, receives correction, then proceeds. One task and two photos are enough.

#### Approach 4B — Landmark-based instruction player.

- **How it connects the two sides:** Expert anchors a small sequence to visible landmarks: “printed star facing you; slot beside the red mark.” Novice receives one image and one action at a time.

- **Why this approach is different:** Converts tacit orientation into stable language and reference images. Unlike 4A it is an author-once guide; unlike 4C it does not modify the object.

- **Build effort and risks:** Step editor, image hotspots, next/back controls; **low–medium**. Wrong initial orientation invalidates later steps; include a starting-view check. It overlaps strongly with existing instruction tools.

- **Smallest demo:** Expert creates three steps for a safe paper assembly; another participant follows them. Do not claim task mastery from tapping “next.”

#### Approach 4C — Shared physical identifiers.

- **How it connects the two sides:** Add temporary numbered/color-labeled stickers to parts; expert references the same identifiers in a tiny digital instruction card. Novice provides the visible identifier and receives the matching step.

- **Why this approach is different:** Removes vocabulary and viewpoint ambiguity by changing the physical environment. Unlike the other approaches, it makes both sides point to a stable shared identifier.

- **Build effort and risks:** Printable labels, simple lookup page; **low**. Label preparation, damaged stickers, and inappropriate labeling of real equipment constrain deployment. Use redundant numbers, not color alone.

- **Smallest demo:** Five labeled components and one assembly. A paper sheet is a credible baseline; avoid QR scanning unless it adds actual value.

### P02: office rejection and applicant correction

#### Approach 2A — Officer-issued correction receipt.

- **How it connects the two sides:** Officer selects an approved reason, specifies accepted replacement evidence and return route; applicant receives a plain-language correction packet and can ask one clarification question.

- **Input, output, and why it works:** Authorized reason and case context → “What is wrong / what to bring / where next.” Moves institutional knowledge into an actionable handoff. Unlike 2B it starts after rejection; unlike 2C it resolves routine cases without another queue.

- **Build effort and risks:** Curated templates, version/source field, receipt; **low** after content is obtained. Stale or unauthorized instructions are the main risk.

- **Smallest demo:** One fictional campus reimbursement policy, three rejection reasons, one reviewed receipt. Label the policy as synthetic unless genuinely supplied by the office.

#### Approach 2B — Applicant-side preflight with explicit unknowns.

- **How it connects the two sides:** Office provides a bounded checklist; applicant answers a decision tree before visiting. Output identifies ready items, missing evidence, and cases needing human review.

- **Why this approach is different:** Prevents predictable mismatches before submission. Unlike 2A it is preventive; unlike 2C it uses deterministic rules rather than case routing.

- **Build effort and risks:** Conditional form and a cited, versioned rule set; **medium**, mostly content work. It cannot establish document authenticity or guarantee acceptance.

- **Smallest demo:** Five questions for one process, one missing item detected, and an “office must decide” branch. No OCR or eligibility prediction.

#### Approach 2C — Exception handoff with an explicit owner.

- **How it connects the two sides:** Front desk captures a case that does not fit a rule and sends a compact context packet to a named authorized reviewer; applicant receives the owner and next step.

- **Input, output, and why it works:** Unresolved exception → accepted review responsibility. Addresses missing authority and ownership, which better wording alone cannot fix.

- **Build effort and risks:** A small case queue and accept/return actions; **medium**. Real value requires a participating reviewer; a fake acceptance is not a working integration.

- **Smallest demo:** Two human-operated roles on one device, one exception, reviewer acknowledgement. Clearly distinguish live prototype role-play from a real office connection.

### P03: repair customer and technician

#### Approach 3A — Constraint-first repair scope card.

- **How it connects the two sides:** Owner enters priorities, exclusions, and budget ceiling; technician returns proposed work, uncertainty, and exclusions. Owner reviews the exact revision.

- **Input, output, and why it works:** “Restore access, preserve files, ask before purchases” → a checked scope. Exposes hidden assumptions before action. Unlike 3B it is structured; unlike 3C it focuses on the initial agreement.

- **Build effort and risks:** Form, comparison view, revision invalidation; **low–medium**. A tick does not demonstrate understanding or legally valid consent. Existing repair products may already suffice.

- **Smallest demo:** One device, two work options, rejected reset, revised non-destructive diagnostic plan. No real repair or payment integration.

#### Approach 3B — Customer question sheet generated from technician terminology.

- **How it connects the two sides:** Technician selects terms from a curated glossary; owner receives plain-language explanations and questions to resolve before agreeing.

- **Why this approach is different:** Translates expertise rather than managing approval. Owner provides uncertain terms and receives explanations; technician receives the owner's follow-up choices.

- **Build effort and risks:** Reviewed glossary and mappings; **low**. Explanations can hide device-specific consequences, so no open-ended generated diagnosis. AI is optional and unnecessary.

- **Smallest demo:** Five verified terms and a clarification request. A printed glossary may achieve the same result; weak standalone concept.

#### Approach 3C — Scope-change checkpoint.

- **How it connects the two sides:** When diagnosis changes proposed work, technician records the delta; owner sees old/new work, cost, and exclusions, then acknowledges or declines the revision.

- **Why this approach is different:** Fixes agreement becoming stale after new information. Unlike 3A it intervenes mid-job; unlike 3B it coordinates action rather than explaining terms.

- **Build effort and risks:** Version history and pending/accepted status; **medium**. A prototype cannot stop real workshop action; staff procedure remains essential.

- **Smallest demo:** An acknowledged screen replacement becomes a board repair proposal and returns to pending. Use a manually opened customer view; do not imply actual SMS delivery.

### P05: borrower and equipment provider

#### Approach 5A — Goal-to-compatible-kit configurator.

- **How it connects the two sides:** Borrower selects recording goal and host device; curated rules propose an available camera/microphone/adapter chain for librarian review.

- **Input, output, and why it works:** “Record interview on this phone” → explained compatible kit or “unknown—ask staff.” Connects task constraints to resources instead of merely searching item names.

- **Build effort and risks:** Tiny inventory and explicit compatibility edges; **medium**. Wrong rules create false certainty; unknown combinations must remain unknown. Unlike 5B it plans before collection; unlike 5C it selects from alternatives.

- **Smallest demo:** Eight synthetic assets, two valid combinations, one missing-adapter case. No recommendation model or live inventory integration.

#### Approach 5B — Handover readiness handshake.

- **How it connects the two sides:** Borrower and librarian perform a two-minute physical check at collection: pieces present, plug fits, short recording works. Both record observed results.

- **Why this approach is different:** Verifies the working chain in the real environment instead of predicting it. Inputs are observed checks; output is a ready kit or a specific missing dependency.

- **Build effort and risks:** Guided checklist, optional photo, staff acknowledgement; **low**. Requires access to actual equipment; a tick without a test is weak evidence.

- **Smallest demo:** A real phone, microphone, and adapter if already available. Otherwise use a transparently labeled simulated equipment fixture, with reduced evidential value.

#### Approach 5C — Dependency label and substitution card.

- **How it connects the two sides:** Provider attaches a human-readable label listing prerequisites and approved substitutes; borrower checks their own device against it before booking.

- **Why this approach is different:** Moves compatibility knowledge to the resource boundary. Unlike 5A it is preauthored and static; unlike 5B it works before physical handover.

- **Build effort and risks:** Label/card editor and static lookup; **low**. Labels go stale and the supported combinations may be too limited. Printed instructions are a legitimate alternative.

- **Smallest demo:** Three assets with dependency cards and one failed fit identified. Do not build a booking system around this intervention.

---

## 7. Unconventional opportunities worth retaining

These ideas emerge from failures at the boundary, rather than adding general intelligence to either side.

### 7.1 Make the listener produce the useful output

People often frame an accessibility problem as “help the non-speaking person say more.” But the next failure may be the staff member's inaccessible spoken reply. The smallest intervention is a **written staff read-back with a user-controlled correction step**. Existing supported-conversation methods already motivate verification [S5](#s5); the unconventional hackathon choice is to apply it to one ordinary campus transaction.

**Buildability:** High for a narrow selection/text interface. **Hard part:** respectful co-design and proving this is better than writing. **Do not claim:** treatment, universal AAC access, or proof of comprehension.

### 7.2 Ask the novice to point back, not watch another explanation

An expert's correct annotation does not show whether the learner mapped it to the right physical part. Ask the learner to point to their interpretation and let the expert verify it. The smallest intervention is **two points on two photos with a human confirmation**.

**Buildability:** Moderate; image coordinates are tractable without computer vision. **Hard part:** image quality, viewpoint changes, and expert availability. **Best safe demo:** assembling a cardboard exhibition model. This is the strongest alternative if P01 cannot be validated locally.

### 7.3 Preserve what must not happen

Service systems emphasize requested work but can lose the constraint that makes the work acceptable: keep files, do not replace an original part, stay below a stated budget. Make that constraint a **persistent item the recipient must explicitly acknowledge**, and make edits invalidate old acknowledgement.

**Buildability:** High; a small revision-aware state machine. **Hard part:** acknowledgement is not enforcement. **Best use:** a feature in a two-sided handoff, rather than a broad new repair platform. The idea is not unique; compare existing forms and approval software honestly.

### 7.4 Turn inventory availability into operational readiness

An item on a shelf is not the same as a usable capability. A camera, cable, storage card, and host computer form a dependency chain. The smallest intervention is **one missing-link check with an approved substitute**, or a physical readiness test at pickup.

**Buildability:** High for a tiny curated dataset. **Hard part:** acquiring trustworthy compatibility information. Fixed kits may be better. This is a useful resource-access idea only when combinations vary enough to justify software.

---

## 8. Skeptical review and final selection

### Five concepts under a judge's scrutiny

#### **PointBack (1A)**

**The gap:** Specific student/staff interaction; expression, return message, and accepted action are distinct. Local pain remains [H]

**Adoption:** Both take a short turn; shared device avoids installs. Staff must actually write and acknowledge

**Difference from alternatives:** Incremental over AAC + written reply. Paper read-back is the direct baseline

**Build and demo:** No AI; little data; 12-hour core credible; correction and re-confirmation are visible

**Strongest objection:** A special form may slow or patronize users. Most likely failure: users prefer their existing AAC and staff bypass the return step

#### **Point-to-Prove (4A)**

**The gap:** Expert and novice can speak but lack a common reference frame

**Adoption:** Both upload/mark a photo; expert review is additional work

**Difference from alternatives:** Distinct reciprocal check, but video calls or marked diagrams may be enough

**Build and demo:** No AI; two photos; moderate image-state work; easy wrong-part/right-part demo

**Strongest objection:** Extra exchange may cost more than it saves. Most likely failure: photos do not make correspondence clearer

#### **ReturnReady (2A)**

**The gap:** Officer knows acceptance rules; applicant needs a corrective action

**Adoption:** Officer must author or approve reasons; applicant mostly receives

**Difference from alternatives:** Similar to good error design and emails; office-issued correction/provenance is the narrow distinction

**Build and demo:** No AI; authoritative template data is the dependency; one workflow buildable

**Strongest objection:** The real barrier may be inconsistent policy or capacity. Most likely failure: no office owner keeps content current

#### **ScopeCheck (3C)**

**The gap:** Owner and technician need a current scope agreement

**Adoption:** Both review changes; shop must stop work while pending

**Difference from alternatives:** Weak standalone novelty against existing repair suites and written approval

**Build and demo:** No AI; synthetic case sufficient for demo; reliable revision flow

**Strongest objection:** Existing software can likely do it. Most likely failure: judges see a small feature rather than a differentiated product

#### **BorrowReady (5A)**

**The gap:** Borrower needs a working chain, provider owns components

**Adoption:** Borrower gives device context; staff maintains compatibility rules

**Difference from alternatives:** Useful only beyond fixed kits; asset products already cover much of the workflow

**Build and demo:** No AI; reliable curated rules needed; clear adapter-failure demo

**Strongest objection:** Tiny demo catalogue may conceal real complexity. Most likely failure: incomplete rules recommend an unusable kit

### Cross-check against the full skepticism checklist

- **Does it remove the barrier?** PointBack removes a missing return channel and exposes disagreements; it cannot make an uncooperative desk cooperate. Point-to-Prove exposes mismatched reference points. ReturnReady translates authorized reasons. ScopeCheck coordinates revisions. BorrowReady checks fit. None should claim broader institutional change.

- **Are both sides clear?** Yes in all five, but ReturnReady fails operationally without an authorized officer and BorrowReady fails without a knowledgeable equipment provider.

- **Will behavior change be realistic?** A one-device exchange is a modest change; ongoing policy or compatibility maintenance is larger. Test staff effort, not just student enthusiasm.

- **Is it another layer?** Each must beat its low-tech baseline in one observed transaction. If not, choose the baseline or abandon the concept.

- **Limited data and unreliable AI?** All selected mechanisms can work without AI. Human-authored content is not automatically correct; provenance and acknowledgement still matter.

- **Implementation window?** Bounded local flows fit. General language understanding, computer vision, institutional integrations, and a compatibility catalogue across many products do not.

- **Can value be shown honestly?** Show a real interaction correction and version reset; label role-play, synthetic policies, and inventory fixtures. A status badge is not evidence of better real-world outcomes.

- **Immediate judge comprehension?** Lead with the two parties and one failed interaction. Avoid explaining AAC taxonomies or architecture before the demo.

### Final selection

**Choose P01 with mechanism 1A: PointBack.** It has the smallest dependency surface and a particularly clear two-way bridge. Established communication-access and verification practices support the underlying design direction [S1, S5, S17]. They do not validate this product or establish local demand.

It beats P04 narrowly on operational simplicity: a shared local device does not require image upload, a physical setup, or remote expert availability. It beats P02 on independence from institutional policy ownership. It beats P03 on the specificity of an underserved encounter, while incorporating its useful insight about constraints and revisions. It beats P05 because no compatibility catalogue is required.

**Trade-offs:** Originality is moderate. The initial audience is deliberately narrow. Both parties must participate. The product does not support every AAC access method. Validation is more important than adding features.

**Decision gate during Round 1:** Try to speak with an intended user or a relevant accessibility practitioner and an IT desk worker. A useful signal is a recent concrete encounter where expression was possible but the staff response or proposed action was not accessible. Do not infer this need from disability alone. If users say their current method already solves the encounter, do not manufacture a gap.

If meaningful validation is unavailable by the selection deadline, state that clearly. Prefer P04 only if the team can actually observe an expert/novice reference-frame failure and test the reciprocal-photo approach. Otherwise retain PointBack as an explicitly unvalidated prototype hypothesis; do not portray a last-minute switch as evidence.

---

## 9. Recommended product: PointBack

> Earlier recommendation from the broad exploration. For the current port direction, see [TallyBridge](#176-recommendation-build-tallybridge-subject-to-one-local-validation-gate).

### A. Problem definition

**One sentence:** Non-speaking students who can use text or selections can express a campus IT request, but may lack an equally accessible way to check staff's interpretation, correct the proposed action, and leave with a shared next step.

**Exact initial users:** Adults at a campus IT counter who cannot reliably use speech, can read the interface language, and can use touch or a keyboard; staff handling a simple device-access inquiry. No diagnosis is required. This is a narrow interaction profile, not a statement about all non-speaking people.

**Disconnected sides:** Student intent, constraints, and choice ↔ staff understanding and proposed service action.

**Example [H]:** A student cannot sign in to a laptop and wants help without erasing their project files. Staff says “we can reset it.” The student needs to know whether that means resetting a password or erasing the device, and must be able to refuse the latter.

**Underlying cause:** The service channel supports spoken staff replies and assumes that a sent request implies shared meaning. The request, proposed action, constraint acknowledgement, and final next step are not consistently represented together.

**Current workarounds:** Existing AAC, typing, paper, a written staff reply, or a chosen supporter. These can work very well. The specific failure to test is an encounter where the reply remains oral or the plan is not checked—not a supposed inability of AAC users to communicate.

**Consequences:** Possible misunderstanding, repeated explanation, reduced independence, and an unacceptable service proposal. The prototype cannot demonstrate reduced real data loss or service abandonment.

**MVP boundary:** Produce and mutually check a service-request summary before any real diagnostic or repair activity. The app does not reset devices, access files, diagnose faults, authenticate students, take payment, or authorize actual workshop work.

### B. Key insight

The missing information may need to come **from the service provider**, not from the person seeking service. More vocabulary or a louder synthetic voice does not ensure that staff's response is accessible or that both people mean the same action.

Represent the exchange as a small agreement in progress: **request → staff interpretation and proposal → correction or confirmation → current written summary**. Keep critical constraints visible throughout. If either side changes a meaningful field, the earlier confirmation no longer applies.

This makes an overlooked boundary visible without claiming to prove comprehension. Pressing “That matches” records an acknowledgement of a displayed version; it does not establish legal consent, informed understanding, or successful service delivery.

### C. What we will build

A browser application used on a single shared tablet or laptop. Two clearly labeled views alternate on the same device. Staff returns the device or changes the view for the student; no remote session, account, or installation is necessary.

**Before:** Student shows a typed request or uses AAC; staff responds orally or loosely; an agreed next step may remain implicit.

**With PointBack:**

1. Student selects **“I need help signing in”** or types a request. A short optional field captures a critical constraint: **“Keep my files.”** The student reviews the exact wording.
2. Staff reads the request and selects or types **“I understand you need help signing in.”** A separate field asks what happens next.
3. Staff enters **“Check the keyboard and account sign-in. No erasure is proposed.”** Staff explicitly acknowledges **“Keep my files.”** Staff can also say **“I cannot promise that; let's clarify before proceeding.”**
4. Student reads the response and chooses **“That matches,” “Not right—change something,” “I don't understand,”** or **“Stop / get help.”** Free text is always available.
5. A correction sends the card back to staff. A confirmed current version yields a short written receipt: request, constraint, acknowledged plan, person acting next, and expected next contact or “not yet decided.”
6. Editing either the request or plan returns the exchange to pending review. The old summary remains visibly superseded during the session; it cannot retain a current-confirmed badge.

**Each side receives:** The student receives an accessible reply and a controllable correction opportunity. Staff receives a specific, current request with constraints and visible confirmation status. Both receive the same summary.

**Action enabled:** They can begin the acknowledged next step or explicitly pause the service encounter without pretending agreement.

**Return use:** A user may return for another desk encounter, or use it once and leave. Recurring use is a hypothesis; success should not depend on daily engagement or an account.

**Memorable moment:** Staff edits a previously checked plan; the “current acknowledgement” disappears and the card asks the student to review the change. The UI makes agreement's limits visible.

### D. Exact bridge mechanism

#### Step 1: Intention → student-reviewed request and constraint

**Person responsible:** Student chooses or writes what they mean

**System rule:** Do not rewrite free text or silently omit constraints

#### Step 2: Request → staff's stated interpretation

**Person responsible:** Staff explains what they understood

**System rule:** Return a response in visible text; keep original request alongside it

#### Step 3: Interpretation → proposed action and constraint response

**Person responsible:** Staff states the next action and whether the constraint can be honored

**System rule:** Do not equate “read” with “can comply”

#### Step 4: Proposal → student's correction, uncertainty, stop, or acknowledgement

**Person responsible:** Student controls their response; chosen support is allowed

**System rule:** Never auto-confirm or make refusal harder than acceptance

#### Step 5: Checked version → shared next-step receipt

**Person responsible:** Both check the displayed version in their respective turn

**System rule:** Receipt refers to that exact request/response version

#### Step 6: Changed content → pending review again

**Person responsible:** Editor explains the change if needed

**System rule:** Acknowledgements from earlier versions cannot count as current

**Without the mechanism:** A student can send “keep my files,” staff can verbally say “reset,” and each can leave with a different interpretation. A generic chat records messages but need not identify the current plan or make changes require another check.

**Important limit:** Software controls its displayed acknowledgement state, not what a real staff member physically does. Deployment would need a staff procedure and evaluation; the hackathon demonstrates the communication mechanism only.

### E. Differentiation

**Closest alternatives:** Paper exchange, AAC plus a written staff reply, Cboard custom boards, TD Snap, Talking Mats, and established supported-conversation techniques [S2–S5]. Repair software also provides relevant workflow precedents [S11](#s11).

**Single most important differentiator:** A staff-returned service plan whose acknowledgement is tied to a particular version, with the user's critical constraint visible throughout.

This is not a highly novel underlying technology. Its case for selection is a well-defined boundary, a respectful two-sided interaction, a reliable functioning mechanism, and an honest comparison to simple alternatives. If user testing shows paper is equally easy and reliable, that weakens the product case. Do not answer that result by adding AI.

---

## 10. Smallest credible MVP

### Five essential features

| Feature | Definition of done | Why it is essential |
|---|---|---|
| 1. Student-owned request card | Select or type one request, optionally add one critical constraint, review it before handoff | Preserves the person's own expression |
| 2. Staff interpretation and proposed next step | Staff returns visible text and answers whether the constraint can be honored | Creates the missing return half of the interaction |
| 3. Correction, uncertainty, and stop controls | Student can correct free text, ask for clarification, or pause without losing their request | Supports agency instead of forced agreement |
| 4. Version-aware acknowledgement | Content edits invalidate earlier acknowledgement; unresolved constraints cannot produce a checked-plan state | This is the distinguishing bridge mechanism |
| 5. Shared summary | Displays the current request, constraint, plan, status, and next person; printable or copyable after review | Produces an actionable handoff rather than another chat |

**Primary action:** Check or correct the other person's understanding of the current service request.

**Minimum data:** Request text; optional constraint text; staff interpretation; proposed action; staff constraint response; next actor; current revision; review status. Timing may be shown as “not yet decided.” Do not collect diagnosis, student identity, credentials, device files, or institutional identifiers.

**Must really function:** Editing, role handoff, all acknowledgement transitions, correction loop, constraint-response handling, reset/start-new, and summary generated from current session data. A hardcoded “success” screen is insufficient.

**May use prepared samples:** Two example requests, several reviewed phrase templates, a fictional student name in the presentation, and a synthetic IT encounter. The desk staff can be a teammate openly role-playing. No IT-system integration is implied.

**Deliberate simplifications:** One device; one desk context; one interface language; one optional critical constraint; no accounts; no backend; session memory by default. The actual typing and selection must work with new input, so the prototype is not merely a clickable script.

### Interaction rules that prevent a misleading demo

- Constraint response options are **“Can honor,” “Cannot honor,” and “Need clarification.”** This is staff-entered information. The app does not infer whether arbitrary language violates a constraint.

- “Cannot honor” or “Need clarification” keeps the request unresolved. The student may revise their own constraint after an accessible explanation, request a different plan, or pause. The system must never silently remove the constraint.

- Confirming checks the displayed version, not the correctness of the technical plan. Do not label this “safe,” “legally authorized,” or “proved understood.”

- Every meaningful request/response edit increments the revision and requires appropriate review again. A current summary must show its revision/status. Earlier acknowledgement cannot be copied to the changed version.

- There is no repair execution button. The final status is **“Shared plan checked”**, not “issue fixed.”

- A single shared device does not authenticate who tapped each role. In the demo, both people operate their turns. Do not market the summary as an audit-grade identity or signature record.

### Complete user journey

#### Entry

**Student:** “Use this screen to ask for IT help and check the reply”; starts new request

**Staff:** Short instruction to reply in writing and allow time

**If something is unclear or wrong:** No diagnosis or login. Explain that the device will change hands

#### Request

**Student:** Chooses “I cannot sign in,” edits if needed, adds “Keep my files”

**Staff:** Not yet asked to interpret

**If something is unclear or wrong:** Blank request gives an inline error and preserves other input

#### Review

**Student:** Reads exact text and selects “Show staff”

**Staff:** Receives an uncluttered request/constraint view

**If something is unclear or wrong:** A back/edit action remains available; nothing sent to a remote system

#### Staff response

**Student:** Waits or uses their usual communication method

**Staff:** Writes interpretation, proposed action, next person, and constraint response

**If something is unclear or wrong:** Missing required response is explained beside the field; no false success

#### Student review

**Student:** Sees their request alongside the reply; chooses matches/correct/unclear/stop

**Staff:** Does not choose on the student's behalf

**If something is unclear or wrong:** “Unclear” returns a clarification request; no auto-accept timer

#### Correction

**Student:** Writes or selects the part needing change

**Staff:** Updates the plan and submits it again

**If something is unclear or wrong:** Revision changes; previous acknowledgement becomes superseded

#### Shared summary

**Student:** Checks the current plan; optionally copies or prints it

**Staff:** Checks the same summary and acts on the specified next step outside the app

**If something is unclear or wrong:** An unresolved constraint remains unresolved; output contains no promise of successful service

#### Finish

**Student:** Chooses “Finish and clear” or starts a new exchange

**Staff:** Ensures the shared device is ready for the next user

**If something is unclear or wrong:** Session content is cleared; explain that a saved/printed copy remains with its holder

**Concrete example:** Student requests login help and preserving files. Staff initially proposes erasing/reinstalling and selects “Cannot honor.” The view says the request is unresolved. Student chooses “Different plan.” Staff revises to checking keyboard/account sign-in without erasure, acknowledges the constraint, and returns the plan. Student checks it; both see the same current summary.

### Accessibility and dignity requirements for the prototype

- Plain text paired with any icon; ordinary language rather than unexplained symbols. Do not assume symbol comprehension or use infantilizing imagery.

- Legible font, strong contrast, large well-spaced controls, visible focus, native form labels, and a logical keyboard order. Never use color alone for pending/checked status.

- Both touch and keyboard paths work. Check the core path with a screen reader if possible; do not claim full accessibility certification.

- Changing view or receiving feedback must not unexpectedly move the user away from the relevant content. Keep error messages specific and preserve input.

- Allow extra time; no countdown, mandatory speech, reading-aloud requirement, or confirmation that only the staff can dismiss.

- Permit chosen assistance and existing AAC. Do not require users to abandon their established communication method.

- Gaze access, switch scanning, symbol-language personalization, aphasia-specific adaptation, and multilingual use require specialist/user testing and are not supported claims of this MVP.

### Simplest technical architecture

```text
Student view                         Staff view
request + constraint                 interpretation + next action
          \                              /
           ---- shared local session ----
                         |
           deterministic revision/review rules
                         |
       corrected / paused / current plan checked
                         |
              shared text summary
              copy or browser print
```

Both views run in the same application on the same device. The diagram does not imply a server or two-device synchronization.

#### Frontend

**Use:** React + Vite + TypeScript for a small client application

**Simpler option:** Familiar, fast static build. Use plain HTML/JS if that is substantially more familiar to the team

**Fallback:** Build and run the packaged static app locally

#### Styling

**Use:** Simple CSS with a small set of consistent spacing, type, and state styles

**Simpler option:** No component framework required; use familiar components only if already available

**Fallback:** Local styles and system fonts; no CDN assets

#### Bridge logic

**Use:** One reducer/state model holding revision and review status

**Simpler option:** Narrow deterministic rules; a few explicit state functions are enough

**Fallback:** Impossible transition leaves the exchange pending and preserves content

#### Data

**Use:** Browser memory for the active session

**Simpler option:** No database or persistence needed; optional explicit draft saving only after core completion

**Fallback:** Reload may lose the draft; warn before leaving during an active exchange and provide a copyable summary

#### Content

**Use:** Local, editable phrase templates reviewed by a person

**Simpler option:** A small bundled data file; templates are suggestions, not diagnosis

**Fallback:** Free text works if no template fits

#### Receipt

**Use:** On-screen summary plus browser print/copy

**Simpler option:** Ordinary text selection is the fallback if clipboard permission fails

**Fallback:** No PDF generation service or cloud account required

#### Hosting

**Use:** Static build on a familiar host, plus local preview as backup

**Simpler option:** Deploy once after core flow works; test on the actual demo device

**Fallback:** If venue internet fails, use the local build on the presentation laptop

#### Optional offline install

**Use:** Add a standard service-worker/PWA setup only with spare time and a complete offline check

**Simpler option:** Local static preview is simpler and sufficient for the demo

**Fallback:** Never advertise offline reload unless it has been tested after network loss

**Why no Next.js, Firebase, or Supabase?** This MVP has no remote coordination, authentication, institutional records, or server-only work. They introduce setup and deployment risk without improving the central interaction. Two-device operation is a later hypothesis, not an essential feature.

**Why no AI, OCR, or speech recognition?** The user supplies intent and staff supplies meaning. Automated interpretation could silently change either. Optional text-to-speech is familiar AAC functionality, not the differentiator, and remains outside the essential build.

### Reliability, fallback, and early tests

**Riskiest technical component:** Keeping acknowledgements attached to the right version across corrections and edits. A stale checked badge would undermine the entire concept.

**Riskiest product dependency:** The usefulness and accessibility of the interaction to intended users. This cannot be solved with more automated tests.

| Risk/test | Early experiment | Required behavior / fallback |
|---|---|---|
| Changed plan retains acknowledgement | Check a plan, edit its action, request, and constraint separately | Each relevant edit returns to review; no current-checked summary survives |
| Unsupported constraint | Staff selects “Cannot honor” or “Need clarification” | Exchange remains unresolved; correction/pause is available |
| User cannot express a novel need | Enter a request outside the prepared examples | Free text survives unchanged; no forced category or model output |
| Staff fills only half the response | Omit proposed action or constraint response | Inline guidance; no accidental completion |
| Refusal or confusion | Choose “Stop” or “I don't understand” | Pause/clarification state; no acknowledgement recorded |
| Browser/storage problem | Reload the active app and try blocked clipboard access | Explain session loss; permit restart and ordinary text copying. No hidden promise of recovery |
| Venue internet unavailable | Disconnect network and open the packaged local build | Complete the whole flow locally with bundled assets |
| User needs a different access method | Observe actual interaction with consent | Allow their existing AAC/supporter; narrow supported scope. A static card is a fallback aid, not proof the app is accessible |

Use a handful of meaningful automated checks for version invalidation and forbidden transitions in Round 2, plus manual end-to-end checks. Avoid spending hours testing decorative components.

**No external AI/API dependency:** Core operation is the same if every external service is unavailable. A recording and screenshots are presentation contingencies; they must be identified as recordings, not substituted silently for a live demonstration.

---

## 11. Round 1: five hours to earn selection

### What judges need to believe

1. This is a specific two-sided interaction failure, supported by credible communication-access guidance and, ideally, a local concrete encounter.
2. Existing expression tools are valuable, yet a staff-returned plan can still be missing; the team understands that distinction.
3. The central mechanism already works at small scale, or the highest-risk transition has been demonstrated.
4. The implementation scope is realistic, and the team will not depend on speech models, institutional systems, or a large training dataset.
5. The team distinguishes a working prototype from proof of user impact.

### Time-blocked plan: 300 minutes

Parallel work here refers to student team assignments, not a requirement for additional AI agents.

#### 0:00–0:40

**Work:** Validate the boundary; ask about a recent service encounter, current workaround, staff response, and unwanted assumptions

**Owner:** Researcher; builder observes an available desk workflow

**Done when:** Notes separated into actual observations and hypotheses; no invented quotes. Ideally one intended user/practitioner and one staff perspective

#### 0:40–1:10

**Work:** Compare existing tools and paper baseline; make the selection decision

**Owner:** Whole team, one person consolidates

**Done when:** One-page comparison; written reason to choose PointBack or a better-evidenced fallback

#### 1:10–1:40

**Work:** Lock scope, wording, story, and state transitions

**Owner:** Builder + researcher

**Done when:** Five-screen wireframe; synthetic example; required and forbidden transitions; explicit exclusion list

#### 1:40–2:40

**Work:** Build a rough local proof of the key transition; prepare source/evidence slide in parallel

**Owner:** Builder(s); presenter handles evidence

**Done when:** Real request → staff response → correction → checked version → edit invalidates acknowledgement. If tooling is unfamiliar, prioritize this over styling

#### 2:40–3:20

**Work:** Test paper and prototype with available participants; revise major friction

**Owner:** Researcher + available users; builder fixes

**Done when:** Observed task results and limitations. Speaking peers test mechanics only. If intended-user access is unavailable, say so

#### 3:20–4:10

**Work:** Prepare concise presentation and submission

**Owner:** Presenter; builders capture demo and limitations

**Done when:** Six-slide deck, one-minute mechanism demo, source links, MVP boundaries, Round 2 plan

#### 4:10–4:40

**Work:** Rehearse, challenge novelty/adoption claims, test local fallback

**Owner:** Whole team

**Done when:** Timed pitch; one honest answer to “why not paper?” and “why not Cboard?”; backup recording

#### 4:40–5:00

**Work:** Final review and submission buffer

**Owner:** One submitter; teammate checks

**Done when:** Correct file/link permissions, accurate feature claims, local copy of deck and prototype

If a participant is unavailable, use that research time to examine the existing workflow or consult a practitioner; do not wait idle or pretend a proxy is an intended user. Keep any user testing respectful, voluntary, and free of sensitive device information.

### High-value validation prompts

- “Tell us about the last time you used an IT or similar service counter. What did each person use to communicate?”
- “How did you know what the staff member planned to do? Was anything unclear?”
- “What already works well? What would you keep using?”
- “Would a staff-written reply help here? When would it get in the way?”
- For staff: “What would make you use or skip this step during a queue? Could you do the same thing with a written note?”

Ask about behavior before showing the idea. “Would you like an app that helps?” is weak evidence.

### Honest Round 1 artifact hierarchy

**Best realistic artifact:** Rough functioning local mechanism, five wireframes, an evidence/assumption sheet, and a short video backup.

**Acceptable transparent mock:** Phrase copy, visual styling, printable receipt appearance, synthetic student/case data, and staff role-play. Label a clickable-only prototype if that is all the team finishes.

**Must not be faked:** User validation, a live campus integration, automated comprehension, real repair authorization, actual accessibility testing, or the revision behavior claimed to work.

**Do not attempt:** Full-stack setup, user accounts, speech models, multilingual generation, vendor integrations, broad AAC boards, or a production design system in five hours.

### Six-slide presentation outline

| Slide | Message | Evidence / visual |
|---|---|---|
| 1. One encounter | “I can show my request. Can I check your reply?” | Student/staff example; mark it illustrative unless observed |
| 2. The gap | Expression → staff interpretation → next action; where the return path fails | One interaction diagram and a concise source-backed rationale |
| 3. Key insight and solution | Make the listener return a checkable plan | Two-role screens; persistent “keep my files” constraint |
| 4. What is different | Revision-specific acknowledgement; complement existing AAC | Paper/Cboard/Talking Mats comparison with honest overlap |
| 5. Feasibility | One local device, no AI/backend; working revision proof | Short live example or clearly labeled prototype recording |
| 6. Evidence, limits, and build plan | What was learned, what remains unknown, and what 12 hours will deliver | Actual validation notes, focused milestones, test targets |

Expected impact should be phrased as **“we will test whether more encounters end with a correctly retained constraint and a shared written next step.”** Do not invent percentages of misunderstandings prevented.

---

## 12. Round 2: implementation in an additional 12–15 hours

### Twelve-hour core plan

Round 2 should assume Round 1 produced a rough proof, not production-quality reusable code. Review it rather than blindly expanding it. Durations below are elapsed team time, totaling 12 hours; independent responsibilities overlap within each block.

#### 0:00–0:45

**Build:** Inspect prototype; lock data fields, revision semantics, and final screen order

**Done when:** One agreed state-transition sheet; no backend or two-device requirement

#### 0:45–2:15

**Build:** Implement the highest-risk mechanism first: revisions, constraint states, corrections, pause

**Done when:** A real entered request reaches checked status; any meaningful edit invalidates it; unresolved constraints cannot complete

#### 2:15–4:15

**Build:** Build student and staff forms and handoff views; researcher reviews language

**Done when:** New free-text input works end to end; role/turn is obvious; no prepared-data dependency

#### 4:15–5:15

**Build:** Build current summary, copy/print, finish-and-clear; decide storage explicitly

**Done when:** Summary reflects current content and status; new session contains none of the previous case; clipboard fallback works

#### 5:15–6:15

**Build:** Complete edge cases, clarification, missing fields, and stopped interactions

**Done when:** No dead ends or lost input on validation errors; refusal is not recorded as agreement

#### 6:15–7:15

**Build:** Test with available participants; compare paper exchange if feasible

**Done when:** Record task completion, missed constraint, staff effort, and preference. Label the sample and its limitations

#### 7:15–8:15

**Build:** Improve readable layout, focus, touch controls, labels, and response language

**Done when:** Core flow usable with keyboard and touch; status understandable without color; major observed friction addressed

#### 8:15–9:15

**Build:** Add/run critical logic checks and manual browser checks

**Done when:** Version/transition checks pass; one happy path, correction, uncertainty, stop, and edit-after-check tested

#### 9:15–10:00

**Build:** Build static artifact, deploy, and rehearse local network-free fallback

**Done when:** Hosted link works on demo browser; same flow works from local build with network disconnected

#### 10:00–11:00

**Build:** Prepare scenario, capture honest backup video, rehearse with both roles

**Done when:** Three-minute script fits; typed inputs, expected outputs, and role switches are practiced

#### 11:00–12:00

**Build:** Buffer for actual failures; feature freeze; final submission

**Done when:** Stable build, saved assets, tested reset, accurate claims, no late infrastructure changes

**Backend/data/integrations allocation:** The 4:15–5:15 block deliberately resolves this category with local session data and no integration. Do not consume the block setting up a database merely because an implementation plan often contains one.

### Optional hours 12–15

| Time | Use only after the twelve-hour core passes |
|---|---|
| 12:00–13:00 | More intended-user/staff feedback and targeted fixes; highest value extension |
| 13:00–14:00 | Optional offline caching/install support, only if team knows the tooling; test after network loss and reload |
| 14:00–15:00 | Final polish, visual consistency, additional browser check, and repeat demo rehearsal |

Do not add an optional feature if it threatens the local working build. If user feedback exposes a fundamental problem, use the extra time to narrow claims or simplify the interaction instead.

### Suggested three-person responsibilities

- **Builder A:** State model and transition checks, then response/summary behavior.

- **Builder B:** Forms and screen flow, keyboard/touch behavior, then static deployment.

- **Researcher/presenter:** Validation, reviewed wording, alternative comparison, manual test cases, and demo. Supports lightweight UI fixes if able.

Integrate after the first state-mechanism block, not at hour ten. With two people, share research and keep one device, plain templates, browser print, and no optional caching.

### Cut plan if the scope slips

1. At hour 4, if the path is not end-to-end, collapse the views into one page with explicit student/staff sections.
2. At hour 6, drop template selection and keep free-text fields plus one optional constraint.
3. At hour 8, drop formatted printing and use an on-screen text summary with ordinary copy.
4. At hour 10, stop polishing and stabilize the local build; deploy only a known-working static artifact.

**Never cut:** The staff return message, the student's correction/stop choice, visible constraints, or version invalidation. Without those, the project becomes a generic note form and loses its reason to exist.

### Credible achievement and boundaries

A credible prototype demonstrates a newly entered request, accessible text reply, one clarification/correction loop, explicit constraint acknowledgement, and revision-correct summary. It does not prove independent real-world deployment, improved service outcomes, broad motor/cognitive accessibility, or institutional compliance.

---

## 13. Three-minute live demonstration

### Preparation

- Two presenters operate the student and staff turns on one shared laptop or tablet. Say that this is a role-play; neither presenter should pretend to represent lived disability experience.

- Seed only the optional phrase templates. Enter the actual request and response live.

- Use synthetic information. Display no real account credentials or personal files.

- Open the deployed version and a tested local build; keep a 60–90-second recording and four screenshots available.

- Disable presentation interruptions and rehearse reset/start-new. Do not claim that opening an already loaded website proves offline support.

### Exact sequence

#### 0:00–0:20

**On screen:** Show a short note: “I cannot sign in. Keep my files.” Staff says “We'll reset it.”

**Narration and result:** “This is an illustrative encounter. The student can express a request, but ‘reset’ may mean different things—and a spoken reply is not an accessible return path for everyone.”

#### 0:20–0:35

**On screen:** Open PointBack entry screen

**Narration and result:** “PointBack gives both people a written turn and a way to check the proposed next step. It complements the person's existing communication method.”

#### 0:35–0:55

**On screen:** Student selects/types **“I cannot sign in”**, adds **“Keep my files”**, reviews and hands over

**Narration and result:** Show the exact request and persistent constraint. “Nothing here requires speech, a diagnosis, or an account.”

#### 0:55–1:20

**On screen:** Staff writes **“You need help signing in”** and **“Erase the device and reinstall”**, then selects **“Cannot honor: keep my files”**

**Narration and result:** Output remains **Unresolved**. “Staff has explicitly said this proposal does not meet the constraint. The app is not detecting meaning with AI.”

#### 1:20–1:40

**On screen:** Student chooses **“Not right—different plan”** and enters **“Check sign-in first; do not erase”**

**Narration and result:** The student's correction returns to staff. “The person requesting help controls whether the plan matches.”

#### 1:40–2:05

**On screen:** Staff revises to **“Check keyboard and account sign-in. No erasure proposed”**, selects **“Can honor”**, next actor **“IT staff”**; student chooses **“That matches”**

**Narration and result:** Show **Shared plan checked**, current revision, and a short written summary. “They now have the same proposed next step in writing.”

#### 2:05–2:25

**On screen:** Staff edits the action by adding **“Consider reinstalling later”**

**Narration and result:** Current acknowledgement disappears; status returns to review. “A checked version is not a blank cheque for a changed plan.” Do not claim the app knows this edit is technically dangerous

#### 2:25–2:45

**On screen:** Undo/revise the proposal appropriately, complete review again, show copyable summary

**Narration and result:** “The differentiator is a staff-returned plan with version-specific acknowledgement. AAC and paper are real alternatives; this makes the check explicit.”

#### 2:45–3:00

**On screen:** Show one evidence/limitations line, then finish

**Narration and result:** “This prototype demonstrates communication, not real repair or proven outcomes. Next we will test it with intended users and desk staff. The aim is a request understood, a constraint retained, and a next step both people can check.”

If the live interaction runs long, omit the second re-confirmation after the edit and end on the correctly pending state. Never rush past the correction merely to show a polished receipt.

### Contingencies

| Failure | Response |
|---|---|
| Venue network fails | Switch to the local packaged app on the presentation laptop; it uses no external API |
| Hosted version has an error | Open a clean local session and repeat the shortest path |
| Application still fails | Say “Here is a recording of the working prototype” and play the backup; use screenshots if video fails |
| Clipboard/print fails | Read the on-screen summary and use ordinary text selection; printing is not the central mechanism |
| Someone types unexpected content | Free text is supported; the app does not promise automatic interpretation. Keep the constraint-response check explicit |
| Judge asks to change the request | Accept a safe synthetic request and demonstrate the same transitions; avoid implying technical diagnosis |

### Thirty-second pitch

> A non-speaking student can show an IT desk a request, yet still leave unsure what staff plan to do. PointBack gives both people a written turn: the student states the need and constraint, staff returns a plain-language plan, and the student corrects or checks it. Change the plan, and it needs checking again. We're building this focused interaction without AI or accounts, then testing whether it improves on ordinary written exchanges.

---

## 14. Judge evaluation, defensible answers, and risk review

### Prospective judge scorecard

These are **[J] projected concept/prototype targets**, not ratings of a completed or tested application. Technical execution cannot honestly receive an achieved score before implementation; the 7 below means the quality level the scoped build could credibly target.

| Criterion | /10 | Reason / what would justify the rating |
|---|---:|---|
| Problem importance | 8 | Independence and accurate service communication matter; local prevalence remains unknown |
| Theme alignment | 10 | Two explicit people move from one-sided expression to a checked shared plan |
| Bridge clarity | 9 | Request, return message, correction, and current acknowledgement are visible |
| Originality/differentiation | 6 | Established communication principles; narrow workflow and revision handling distinguish execution |
| User experience | 7 | Potentially simple and respectful; intended-user testing could reveal serious issues |
| Technical execution | 7 target | Small deterministic mechanism can work well; depends on actual quality of build and tests |
| Feasibility | 9 | No model, backend, catalogue, or institutional integration required |
| Reliability | 9 target | Small local state model; still needs transition and browser checks |
| Demonstration quality | 9 | A misunderstanding, correction, and invalidated acknowledgement fit three minutes |
| Practical usefulness | 7 | Plausible improvement for a narrow encounter; written notes are a strong alternative |
| Future development | 7 | Other desks and reviewed formats are possible, but each requires validation |

Do not average these into a supposed judge prediction. The official rubric and actual prototype performance are unknown.

### Biggest reasons this could lose

1. **Insufficient user evidence:** Judges see an imagined accessibility need rather than a documented encounter.
2. **Weak novelty:** The project resembles a form or notes app, and the team cannot show why its enforced check helps.
3. **Added burden:** Staff and students find it slower or less flexible than their existing methods.
4. **Exclusion through design:** The intended user cannot read, navigate, or select the offered choices; the team overclaims accessibility.
5. **A false agreement:** Changes retain the checked badge, constraints disappear, or refusal looks like success.
6. **Overclaiming impact:** The pitch implies prevented data loss, validated comprehension, or real IT integration based on a staged interaction.

### Changes most likely to improve selection and final judging

**Essential:** One concrete intended-user/practitioner insight; staff participation; an honest paper baseline; a working correction loop; correct revision invalidation; a useful written return message; and a tight, accurate demo. If no direct user evidence is available, state the limitation and present a specific validation plan.

**Optional polish:** Better spacing, icons paired with text, subtle transitions, a printable layout, offline installation, and extra reviewed phrases. These cannot compensate for a weak problem or inaccessible core flow.

### Likely judge questions and defensible answers

#### Why not use paper or a notes app?

Often that is sufficient. Our specific hypothesis is that visible constraint acknowledgement and automatic re-review after edits make misunderstandings easier to catch. We must test that against a structured paper exchange, not just an intentionally bad conversation

#### How is this different from Cboard or TD Snap?

Those are established AAC tools. We focus on the service provider's written response and a revision-specific shared next step. Users can continue using their existing AAC

#### Is this original?

The principles are not new. Supported conversation, read-back, forms, and approvals already exist. The contribution is a focused, functioning service-counter workflow; we claim incremental differentiation

#### Have actual users validated it?

Report exactly who participated and what was observed. If no intended user participated, say so. Peer role-play validates mechanics only, and usefulness remains a hypothesis

#### Who exactly can use the first version?

Adults who can read the interface language and select or type using touch/keyboard, including non-speaking students. We do not claim support for every access method or cognitive/language profile

#### Does clicking confirm prove understanding?

No. It records acknowledgement of a displayed version. Correction, uncertainty, and stop are equally available; actual understanding needs further evaluation

#### Can it prevent staff erasing files?

No. It can expose an incompatible proposed plan and keep acknowledgement pending. Real action depends on staff procedures; the prototype never controls the device being serviced

#### Does AI detect contradictory plans?

No. Staff explicitly states whether the constraint can be honored; the app enforces that declared status. Meaning and technical judgment remain human responsibilities

#### Why would busy staff use it?

They might not. We chose a short shared-device exchange to reduce adoption effort and will measure staff effort and preference. If it adds work without value, we simplify or reject it

#### What if a user says the phrases do not fit?

Free text and the person's existing AAC remain available. Templates are optional; the app never translates or rewrites the person's intent silently

#### What is actually built versus simulated?

The local request/response flow, correction, revision invalidation, and summary must work. The campus encounter and service actions are role-play. No institutional integration or real repair is claimed

#### Why no backend or AI?

Neither is needed for one shared-device transaction. Avoiding them leaves time for reliable interaction and testing. Remote sessions would need separate validation and design

#### Is the receipt legally binding or identity verified?

No. It is a shared communication summary, not a signature, authorization, or audit-grade record. The prototype has no identity verification

#### How would you measure usefulness?

Compare existing-method and prototype interactions for retained constraints, correct description of the next step, correction success, effort, and user preference. Use a small pilot to improve design, not to claim population-level impact

#### What could this become after the hackathon?

First a co-designed, evaluated desk tool. Only then consider reviewed languages, more access methods, multiple desks, or user-requested remote sessions. Expansion is conditional on demonstrated benefit

### Evaluation plan after the prototype

With consent and accessible participation, compare short synthetic service tasks using the participant's usual method plus a written reply against PointBack. Counterbalance order if practical, keep task complexity comparable, and let users use chosen support in both conditions.

Record whether the constraint is retained, whether both can identify the same proposed action, whether a mismatch is corrected, approximate completion effort, and which interaction the user prefers. A confirmation click alone is not a comprehension measure. Do not treat speed as more important than control or comfort.

**[T] Functional acceptance:** All tested meaningful edits invalidate the old acknowledgement; unresolved constraints never produce a current checked plan; novel free text survives unchanged; correction and stop paths work. These are implementable checks.

**[T] Product signal:** Intended participants can complete their chosen interaction and identify a concrete benefit over their baseline without unacceptable extra effort. Set a numeric outcome target only after observing the baseline; do not manufacture a percentage improvement now.

### Biggest risks and mitigations

| Risk | Why it matters | Mitigation / decision rule |
|---|---|---|
| No genuine unmet need | Existing methods may work well | Validate recent encounters first; abandon the product claim if no added value appears |
| Staff bypasses the return step | The bridge requires both sides | Keep it brief, observe staff use, and avoid remote signup. Software cannot solve unwilling participation |
| Interface limits expression | A structured form can exclude or patronize | Free text, optional templates, stop/clarify, existing AAC, and intended-user testing |
| Acknowledgement mistaken for consent | Bad status language exaggerates the meaning | Use “shared plan checked”; explain exact version and limits; no legal/medical claims |
| Staff incorrectly claims a constraint can be honored | Human input can be wrong | Make the claim explicit, preserve the original text, allow uncertainty, and clarify that no automatic technical verification occurs |
| Stale checked status | Defeats the core mechanism | Centralize revision rules; test edits from every relevant state before visual polish |
| Shared-device privacy | A later user may see the previous request | Avoid identifiers; session-only data; prominent finish-and-clear; test reset |
| Loss of active draft | Local memory disappears on reload | Explain session behavior; copy summary; local draft persistence only if intentionally designed and tested |
| Network/deployment failure | Can derail a live demo | Bundle all assets; tested local build; openly labeled backup recording |
| Late scope growth | 12–15 hours is short | One encounter, one optional constraint, no backend, no API. Enforce the cut plan |

### Features explicitly excluded

- General-purpose chatbot, AI paraphrasing of user intent, or automated technical diagnosis.
- Speech-to-sign-language translation, sign recognition, or claims of replacing interpreters.
- A full AAC vocabulary system, custom motor-access system, or language-development tool.
- Unreviewed multilingual translation or symbols assumed to be universally understood.
- Computer vision, OCR, document scanning, or reading private device files.
- Remote repair, password handling, account recovery, device reset, or executable IT actions.
- Two-device realtime chat, public session links, account registration, or identity verification.
- Cloud databases, institutional integrations, help-desk ticket synchronization, or payment.
- Legal signatures, formal informed-consent workflows, clinical use, or compliance claims.
- Dashboards, analytics portals, staff leaderboards, recommendation feeds, or gamification.
- A marketplace, resource directory, campus-wide rollout, or multiple service contexts.
- Persistent personal histories by default, diagnosis collection, or unnecessary student identifiers.
- Automatically judging whether the person understood or is competent to decide.
- Optional polish that delays the correct request/response/revision mechanism.

---

## 15. Final decision sheet

> Earlier decision sheet. The current port-domain ranking and recommendation are in [section 17](#17-current-direction-ports-cargo-handling-and-administrative-handoffs).

### Ranked top ten problem opportunities

The order follows the revised matrix; tiny differences should not be interpreted as empirical certainty.

| Rank | Problem opportunity | Weighted score | Main selection argument |
|---|---|---:|---|
| 1 | P01: non-speaking student ↔ IT desk's reply and plan | 81.0 | Meaningful, observable two-way encounter; smallest dependency surface |
| 2 | P04: expert ↔ novice's physical reference frame | 80.2 | Distinctive reciprocal interpretation check; safe physical demo possible |
| 3 | P02: rejection reason ↔ applicant correction | 78.8 | Strong institutional handoff, provided an office supplies authoritative content |
| 4 | P03: repair outcome ↔ current scope | 76.8 | Reliable correction/revision mechanism, but established alternatives are strong |
| 5 | P05: borrower goal ↔ compatible equipment kit | 76.7 | Useful resource connection if dynamic combinations justify more than fixed kits |
| 6 | P09: tenant observation ↔ reproducible fault report | 75.3 | Good evidence handoff; repair willingness remains outside the app |
| 7 | P12: Deaf participant ↔ group decisions | 74.9 | Genuine distinction between captions and agreement; group adoption harder |
| 8 | P06: cleaner observation ↔ maintenance task | 73.5 | Practical boundary, but mature ticketing patterns and capacity constraints |
| 9 | P10: student confusion ↔ useful office-hours help | 72.7 | Accessible setting; a well-designed template may be enough |
| 10 | P16: teammates' task labels ↔ accepted completion | 72.0 | Easy to build, weak differentiation against established workflows |

### Top three concepts compared

| Concept | Bridge | Best reason to choose | Best reason to decline |
|---|---|---|---|
| **PointBack** | Student intent → staff-written interpretation/plan → student correction/check → versioned summary | Clear two-way accessibility interaction with no external technical dependencies | Needs direct validation; a paper exchange may be equally good |
| **Point-to-Prove** | Expert's reference point → novice's selected counterpart → expert correction | More visually distinctive; transfers understanding between physical viewpoints | Requires good images and active expert review; video may be simpler |
| **ReturnReady** | Authorized rejection reason → accepted corrective evidence → explicit return route | Concrete institutional pain and actionable output | No authoritative office content or owner means no trustworthy product |

### Use this as the submission checklist

- **Decision and justification:** the rankings above and [skeptical review](#8-skeptical-review-and-final-selection).
- **Product and bridge mechanism:** [PointBack specification](#9-recommended-product-pointback).
- **MVP, full journey, stack, and fallback:** [MVP plan](#10-smallest-credible-mvp).
- **Execution:** [Round 1](#11-round-1-five-hours-to-earn-selection) and [Round 2](#12-round-2-implementation-in-an-additional-1215-hours).
- **Presentation:** [three-minute demo and 30-second pitch](#13-three-minute-live-demonstration).
- **Defense:** [judge questions, risks, and excluded features](#14-judge-evaluation-defensible-answers-and-risk-review).

**Decision to carry into the hackathon:** Build the smallest interaction in which a person can see, correct, and check what another person plans to do. Earn selection by demonstrating that boundary clearly and showing that the team understands its alternatives and limits.

---

## 16. Sources and research limitations

All sources below were retrieved on **17 October 2026**. Pages can change. Product sources establish advertised behavior only; no account-based product trials were performed. Public-page retrieval did not provide a systematic market search. Sources were selected to test likely overlaps and mechanisms, not to prove a preferred idea novel.

#### S1

[ASHA public AAC guidance](https://www.asha.org/public/speech/disorders/aac/)

AAC includes multiple communication methods and needs individual fit. The requested URL returned a page titled “CHSA / Augmentative and Alternative Communication” at access; attribution follows the requested ASHA address

#### S2

[Cboard repository](https://github.com/cboard-org/cboard) and [README](https://raw.githubusercontent.com/cboard-org/cboard/master/README.md)

Open-source browser AAC, symbols, and speech synthesis. This is an existence/feature comparison, not a recommendation to copy the project

#### S3

[Tobii Dynavox TD Snap](https://www.tobiidynavox.com/pages/td-snap)

Symbol/text page sets and multiple access methods; evidence of mature AAC alternatives

#### S4

[Talking Mats: what is a Talking Mat?](https://www.talkingmats.com/about/what-is-a-talking-mat/)

Visual framework with topics/options/scale, available physically and digitally; a close two-sided communication precedent

#### S5

[Aphasia Institute: communicative access and supported conversation](https://www.aphasia.ca/communication-tools-communicative-access/)

Communication-partner techniques and verification principles; not direct evidence about campus IT services

#### S6

[AHRQ: Use the Teach-Back Method, Tool 5](https://www.ahrq.gov/health-literacy/improve/precautions/tool5.html)

Established teach-back/show-me practices in healthcare; mechanism precedent only outside that setting

#### S7

[DigiLocker](https://www.digilocker.gov.in/)

Document access, sharing, and verification; not proof of how a particular office accepts documents

#### S8

[Jotform: conditional logic](https://www.jotform.com/help/57-smart-forms-conditional-logic-for-online-forms/)

Existing conditional-form capability; limits originality claims for preflight forms

#### S9

[GOV.UK Design System: check answers](https://design-system.service.gov.uk/patterns/check-answers/)

Established pre-submission review pattern

#### S10

[GOV.UK Design System: error summary](https://design-system.service.gov.uk/components/error-summary/)

Established actionable error presentation linking to field errors

#### S11

[RepairShopr](https://www.repairshopr.com/)

Advertised repair tickets, estimates, portal, intake, attachments, and communication. No assumption that all approval options were evaluated

#### S12

[Shelf](https://www.shelf.nu/)

Advertised open-source asset platform with bookings, custody, kits, and labels. Detailed compatibility features were not tested

#### S13

[Cheqroom help center](https://help.cheqroom.com/en/) and [legacy kit URL](https://help.cheqroom.com/en/articles/1494130-creating-kits)

The legacy URL returned help/search content listing kits, booking, checkout, and access categories; a detailed kit article was not verified

#### S14

[SafetyCulture checklist guidance](https://safetyculture.com/checklists)

Retrieved page was branded “Mitti (by SafetyCulture)” and described repeatable procedures and recorded checklist outcomes; no broader product behavior inferred

#### S15

[Microsoft Learn: Dynamics 365 Guides overview](https://learn.microsoft.com/en-us/dynamics365/mixed-reality/guides/overview)

Documented spatial instruction mechanism. This is not an assertion of current procurement availability or a recommendation for its hardware

#### S16

[myTurn](https://myturn.com/)

Advertised lending, reservations, check-in/out tooling, and reminders

#### S17

[Communication Access UK](https://communication-access.co.uk/)

Communication-access training/standards and partner behavior. Page reported transition-related account/signup unavailability at access; no signup is required for our plan

#### S18

[iFixit Answers](https://www.ifixit.com/Answers)

Existing community repair question-and-answer workflow

#### S19

[Shrubsole, Power & Hallé, 2023: communication partner training implementation review](https://doi.org/10.1111/1460-6984.12805), [PubMed record](https://pubmed.ncbi.nlm.nih.gov/36417196/)

Indexed abstract retrieved through Europe PMC; 17-study review of barriers/facilitators in familiar-partner aphasia training. Limited transfer to this proposed service context

**Unverified leads excluded from factual comparisons:** A RepairDesk estimate page and a MaintainX procedure page could not be reliably retrieved. Their detailed capabilities have not been used as established evidence. Failure to retrieve them does not imply those products lack the relevant functionality.

**Still needed before stronger claims:** Intended-user and staff interviews; observation of an actual service interaction; usability/access-method testing; direct comparison with paper and existing AAC; configuration-level competitor checks; and pilot evidence that the shared plan is useful after the conversation. None of these should be replaced with optimistic scores or a polished role-play.

---

## 17. Current direction: ports, cargo handling, and administrative handoffs

**Updated brief:** Explore seaports and cargo logistics, especially the boundary between physical handling and administrative work. This section is the current domain-specific assessment. Sections 1–16 retain the earlier broad exploration; PointBack is the earlier recommendation, not the recommendation for this new direction.

### 17.1 Start with the actual disconnect

The useful framing is **“what cannot cross from operations to administration, or back, in a usable form?”**

Several different failures can occur:

- A handler sees cargo, but the office sees a manifest. Their quantities, identifiers, or units may not mean the same thing.
- A system reports a hold, but the person who can correct it does not receive a specific, accepted task.
- A driver receives an instruction, but a later change never reaches the person executing the trip.
- Multiple participants can see a status, yet none has accepted responsibility for the next action.
- An observation is copied into an official-looking record without retaining its source, uncertainty, or review state.

These are hypotheses to investigate locally. Ports vary enormously. Modern terminals already have sophisticated operating systems and digital coordination; it would be inaccurate to describe the whole industry as paper-based.

**Terminology:** A *manifest* lists cargo for a movement; a *tally* records quantities observed during handling; a *terminal* is a specific cargo facility; a *forwarder* arranges freight movements; *drayage* is short-distance container transport. A pallet, carton, item, and kilogram are different quantities—not interchangeable labels.

### 17.2 What the existing ecosystem already solves

#### Ship-to-authority administration is already being digitized

IMO describes the Maritime Single Window as a shared electronic entry point for information concerning ship arrival, stay, and departure. The IMO page states that the requirement took effect on 1 January 2024 [PS1](#ps1).

**Implication:** “One website for all port documents” is neither a new insight nor a credible student implementation. Ship-clearance administration also must not be confused with cargo release or customs authorization.

#### Cargo visibility, release, and truck pre-notification already have products

Portbase Cargo Controller advertises consolidated cargo, customs, unloading, and exception information [PS5](#ps5). Secure Chain digitally passes collection rights through authorized participants [PS6](#ps6). HCN Road supports truck pre-notification and status feedback [PS7](#ps7).

**Implication:** A colored “ready to collect” dashboard needs a much stronger case. A prototype cannot manufacture collection rights, official release, or a reliable live terminal status.

#### Standards and operational platforms already address interoperability

DCSA publishes standards for port-call coordination, tracking events, and electronic bills of lading [PS2](#ps2)–[PS4](#ps4). CargoWise advertises integrated forwarding, customs, warehouse, and landside workflows [PS9](#ps9). Logward explicitly advertises stakeholder coordination and exception handling [PS10](#ps10). Kaleris supplies terminal and yard operating products [PS11](#ps11).

**Implication:** Neither “standardize port data” nor “manage logistics exceptions” is a defensible novelty claim. We need one specific boundary that a small operator or a particular workflow still handles poorly.

#### What remains open

The research establishes these existing capabilities. It does **not** establish that the proposed gaps remain unsolved at a particular port.

The working opportunity is a narrow tool for a documented handoff outside, or poorly served by, an existing system. Configuration of an existing platform is a serious alternative. We have not verified a local underserved operator, willingness to adopt, pricing advantage, or a competitor feature gap.

### 17.3 Twelve concrete problem opportunities

All scenarios and local needs below are **hypotheses**. The scores later are judgments, not measured industry statistics.

#### L01. Physical tally ↔ administrative shipment quantity

**People:** Cargo tally clerk or receiving handler; documentation clerk; operations supervisor.

**Situation:** The manifest expects 24 cartons. The receiving note says “3 pallets.” The office cannot tell whether the shipment is complete. A later carton count finds 8, 8, and 6 on those pallets.

**Why the gap exists:** Different units, grouping, partial observations, and lost context make a physical count unusable as an administrative quantity.

**Current workaround:** Tally sheets, calls, spreadsheets, photographs, and terminal/warehouse software. A configured operating system may already do this well.

**Remaining failure and consequence:** Rekeying “3” as a comparable quantity, treating an incomplete count as complete, or losing the observation behind a discrepancy can cause follow-up work and unsupported shortage reports.

**Small bridge:** Preserve the observed unit and grouping; compare only compatible, sufficiently complete counts; create an evidence-linked discrepancy for human review.

**Validate first:** Find a recent actual tally-to-office mismatch. Ask whether the problem was units, incomplete counting, duplicate counting, or an unrelated inventory process.

#### L02. Administrative hold ↔ an accepted corrective action

**People:** Transport dispatcher or forwarder; documentation/release desk; party responsible for the missing item.

**Situation:** A pickup case is marked “documentation mismatch.” Several people know it is blocked, but nobody knows which reference is wrong, what replacement is acceptable, or who must verify it.

**Why the gap exists:** A status or rejection code is not a remedy, owner, or acceptance decision.

**Current workaround:** Calls, email threads, shared tickets, port-community systems, and logistics exception platforms [PS5](#ps5), [PS10](#ps10).

**Remaining failure and consequence:** Repeated messages and premature dispatch when resolution responsibility is unclear. This is not evidence that Portbase or Logward lacks the needed workflow.

**Small bridge:** Issuing desk states the reason, required correction, owner, and verification step; recipient accepts the task; issuing desk reviews the submitted correction.

**Validate first:** Does an existing tool already supply this? Is the delay missing context, missing authority, an unavailable document, or simply processing capacity?

#### L03. Container status ↔ dispatch readiness

**People:** Dispatcher, driver, terminal, carrier, and relevant releasing authorities.

**Situation:** “Discharged” is mistaken for “collectable,” although another prerequisite is unresolved.

**Why the gap exists:** Different parties control distinct prerequisites; a milestone is mistaken for permission.

**Current workaround:** Status portals, pre-notification services, release platforms, and manual checks. Portbase already addresses substantial parts of this [PS5](#ps5)–[PS7](#ps7).

**Remaining failure and consequence:** An incomplete or stale view can produce an unnecessary trip. Real availability and authority cannot be inferred from a mock checklist.

**Small bridge:** An evidence-and-freshness checklist for human dispatch review, with unknowns explicit. Never call it official gate approval.

**Validate first:** Can genuine, authorized status inputs be obtained? Without them, this is a training simulator rather than a live readiness product. Not a leading choice.

#### L04. Visible handling damage ↔ a joint condition record

**People:** Handing-over handler, receiving handler, supervisor, and later claims administrator.

**Situation:** A crushed carton is photographed after a handover, but the record does not show whether it was seen before or after custody changed.

**Why the gap exists:** Physical condition, location, time, and custody event are recorded separately.

**Current workaround:** Condition reports, photos, handover sheets, inspections, and operating-system records.

**Remaining failure and consequence:** Ambiguous evidence prompts repeated investigation and disagreement. Photos alone do not establish causation or liability.

**Small bridge:** Both parties review an item-linked observation and can acknowledge seeing it or record disagreement.

**Validate first:** Which condition report already exists, who can sign it, and whether a shared record actually improves the handover. Avoid automatic fault assignment.

#### L05. Changed empty-container return instruction ↔ the actual trip plan

**People:** Carrier or authorized instruction issuer; dispatcher; driver; receiving depot.

**Situation:** An empty-container return is planned for Depot A. The authorized instruction changes to Depot B, but the driver retains the earlier message.

**Why the gap exists:** The latest instruction, its source, and the executor's acknowledgement are not necessarily linked.

**Current workaround:** Carrier/depot portals, dispatch systems, calls, messaging, and pre-notification tools.

**Remaining failure and consequence:** Old instructions can survive outside the official system, leading to a failed return attempt. Actual local recurrence is unverified.

**Small bridge:** Source-linked instruction versions, visible change summary, and dispatcher/driver acknowledgement; unknown depot acceptance stays unknown.

**Validate first:** Who is authorized to change the instruction? Does the existing dispatch workflow already propagate it? A prototype cannot invent depot acceptance.

#### L06. Approved cargo instructions ↔ the handling crew's understanding

**People:** Authorized cargo planner, shift supervisor, handling crew.

**Situation:** An approved special handling instruction is buried in an office attachment and does not reach the relevant crew before work begins.

**Why the gap exists:** Instructions are not reliably bound to the cargo/job and current shift.

**Current workaround:** Toolbox briefings, work orders, operating systems, labels, and controlled procedures.

**Remaining failure and consequence:** A stale or missed instruction may have serious consequences. Acknowledgement alone cannot prove safe execution.

**Small bridge:** Display the current approved instruction and its source; require the supervisor to record the crew briefing or escalate uncertainty.

**Validate first:** Applicable procedures and authority. Do not generate lifting plans, dangerous-goods advice, load limits, or operating instructions. Too sensitive for an unreviewed general assistant.

#### L07. Small exporter's documents ↔ consistent shipment data

**People:** Small exporter, forwarding/documentation clerk, recipient of the submission.

**Situation:** Two documents use different package counts or shipment references, discovered only after submission.

**Why the gap exists:** Fields are copied across documents with different meanings and revision histories.

**Current workaround:** Templates, spreadsheets, freight software, document review, and standardized eBL workflows [PS4](#ps4), [PS9](#ps9).

**Remaining failure and consequence:** Manual inconsistency can trigger review and rework; matching text alone cannot establish regulatory correctness.

**Small bridge:** Human-entered cross-document comparison with source fields and explicit unresolved differences.

**Validate first:** Which fields must match in the selected workflow? Real differences may be legitimate. Avoid generic “AI customs compliance” and automatic document correction.

#### L08. Outgoing shift's unresolved issue ↔ incoming shift's accepted responsibility

**People:** Outgoing supervisor, incoming supervisor, documentation desk.

**Situation:** Cargo remains on hold at shift change, but its owner, last verified fact, and next check are absent from the handover.

**Why the gap exists:** A status transfers without the context and obligation attached to it.

**Current workaround:** Shift logs, calls, handover boards, work orders, and team messaging.

**Remaining failure and consequence:** Repeated investigation or an unowned exception. Existing task systems may already address this.

**Small bridge:** A handover packet with current evidence, unresolved question, named next actor, and explicit acceptance.

**Validate first:** Whether the issue is a missing interface or a weak management process. Feasible, but generic unless tied to a specific cargo exception.

#### L09. Gate rejection code ↔ a driver's actionable next step

**People:** Driver, gate staff, dispatcher, responsible documentation desk.

**Situation:** The driver is told a local rejection code and calls several people without knowing which desk can correct the problem.

**Why the gap exists:** Operational codes assume institutional knowledge and may be communicated in an unfamiliar language.

**Current workaround:** Gate instructions, dispatcher calls, signs, apps, and terminal status feedback [PS7](#ps7).

**Remaining failure and consequence:** An accurate code can still be unusable to its recipient.

**Small bridge:** A terminal-approved code-to-action card: reason, responsible desk, required next step, and a way to send context back.

**Validate first:** Obtain authoritative code meanings. Reviewed language templates are preferable to unverified translation. This can become the driver-facing view of L02, rather than a separate product.

#### L10. Contractor's evidence ↔ access-document review

**People:** Visiting maintenance contractor, sponsoring company, access-document reviewer.

**Situation:** A technician arrives with one expired or missing required document and cannot complete the access review.

**Why the gap exists:** Requirements, expiry, sponsorship, and review ownership are scattered.

**Current workaround:** Access systems, document checklists, email, contractor-management tools.

**Remaining failure and consequence:** Unproductive visits; however, the boundary is well served by existing software in many settings.

**Small bridge:** A source-controlled pre-review checklist that identifies unknowns and routes them to a reviewer.

**Validate first:** Exact local requirements and reviewer participation. The MVP must never issue a real access credential or imply security clearance.

#### L11. Changed berth plan ↔ coordinated service commitments

**People:** Vessel agent, terminal planner, pilot/tug service coordinators, other port-call participants.

**Situation:** A schedule change is communicated to some services, but the operational plan is no longer synchronized.

**Why the gap exists:** Different systems represent requested, planned, and confirmed times differently.

**Current workaround:** Port-call systems, calls, shared plans, and emerging standard event exchange. DCSA explicitly targets this coordination problem [PS2](#ps2).

**Remaining failure and consequence:** Delays and resource conflicts are plausible, but a functioning operational optimizer needs data and authority far beyond this hackathon.

**Small bridge:** A training-only change-acknowledgement simulator.

**Validate first:** Access to actual service events and participants. Reject autonomous berth scheduling or claimed live optimization for this team and time window.

#### L12. Reefer handoff ↔ acknowledged monitoring responsibility

**People:** Outgoing/incoming handling teams, authorized reefer operator, operations supervisor.

**Situation:** At a handover, people do not share a current record of who is responsible for the next monitoring check.

**Why the gap exists:** Physical handoff, equipment state, and monitoring responsibility can be different records.

**Current workaround:** Reefer monitoring systems, controlled logs, alarms, and operating procedures; standardized reefer event exchange also exists [PS3](#ps3).

**Remaining failure and consequence:** Potentially serious cargo loss. A task app cannot establish temperature compliance or safe equipment state.

**Small bridge:** Acknowledged responsibility transfer, using authorized observations only.

**Validate first:** Actual workflow and qualified operational review. Exclude temperature control, alarm replacement, and inferred cargo safety. High importance does not make this the best student MVP.

### 17.4 Ranked shortlist

The same twelve weights from [section 4](#4-weighted-ranking-and-shortlist) are used. Scores are preliminary **judgments**. Frequency, reach, and benefit are unmeasured. Differences of one or two points are not decisive.

| Rank | Problem | Score /100 | Main reason for the position |
|---|---|---:|---|
| 1 | **L01: tally → administrative quantity** | **83.0** | Concrete physical/digital transformation; no external live data required |
| 2 | **L02: hold → accepted corrective action** | **81.5** | Strong administrative bridge; crowded exception-management category |
| 3 | **L05: changed return instruction → trip acknowledgement** | **78.9** | Clear change-propagation demo; authorized source still required |
| 4 | L09: rejection code → driver's next step | 78.8 | Useful narrow interface; requires terminal-approved meanings |
| 5 | L04: damage observation → joint condition record | 78.6 | Compelling evidence handoff; liability must remain outside scope |
| 6 | L08: shift exception → incoming owner | 78.4 | Very buildable; risks being an ordinary task tracker |
| 7 | L06: approved instruction → handling crew | 75.4 | Important, but needs operational review and careful limits |
| 8 | L03: status → dispatch readiness | 72.7 | Strong existing products; inaccessible live prerequisites |
| 9 | L07: documents → consistent data | 72.1 | Existing freight/document tools; semantic and policy ambiguity |
| 10 | L12: reefer handoff → monitoring owner | 70.3 | Serious consequences and unavailable operational verification |
| 11 | L10: contractor documents → review | 69.8 | Feasible but limited differentiation and local-policy dependence |
| 12 | L11: berth change → service commitments | 69.1 | Many integrations and authorities; too ambitious for live use |

**How to interpret the ranking:** L01 leads because the team can implement the actual representation change with entered data. It does not need to pretend to know whether Customs or a terminal has released cargo. L02 could win with a strong real-world contact and a documented unresolved case.

The earlier PointBack score and this ranking are not a market-level comparison. The domain, available evidence, and required local validation differ.

#### Full twelve-criterion estimates

The following compact tables expose the judgments behind each total. Each criterion is scored from 1–10; higher is more favorable. Weights remain 10, 6, 4, 10, 6, 10, 10, 12, 7, 10, 8, and 7 respectively, totaling 100. A low “weak alternatives” score means strong existing alternatives.

#### Problem and theme

| Problem | Severity | Frequency | Reach | Connection |
|---|---:|---:|---:|---:|
| L01 | 7 | 7 | 5 | 9 |
| L02 | 8 | 8 | 7 | 10 |
| L05 | 7 | 7 | 7 | 9 |
| L09 | 7 | 8 | 7 | 9 |
| L04 | 8 | 6 | 6 | 9 |
| L08 | 7 | 8 | 6 | 9 |
| L06 | 9 | 7 | 7 | 10 |
| L03 | 8 | 8 | 8 | 10 |
| L07 | 8 | 7 | 8 | 9 |
| L12 | 10 | 7 | 6 | 10 |
| L10 | 6 | 7 | 7 | 8 |
| L11 | 9 | 8 | 8 | 10 |

#### Alternatives and buildability

| Problem | Weak alternatives | Theme fit | Differentiation | Feasibility |
|---|---:|---:|---:|---:|
| L01 | 5 | 10 | 8 | 9 |
| L02 | 3 | 10 | 6 | 9 |
| L05 | 4 | 10 | 7 | 8 |
| L09 | 3 | 10 | 5 | 9 |
| L04 | 4 | 10 | 6 | 8 |
| L08 | 4 | 9 | 5 | 9 |
| L06 | 4 | 10 | 6 | 6 |
| L03 | 2 | 10 | 4 | 7 |
| L07 | 3 | 9 | 4 | 7 |
| L12 | 3 | 10 | 6 | 4 |
| L10 | 3 | 9 | 4 | 8 |
| L11 | 2 | 10 | 5 | 4 |

#### Delivery and impact

| Problem | Data access | Demo | Impact | Reliability |
|---|---:|---:|---:|---:|
| L01 | 9 | 10 | 8 | 9 |
| L02 | 8 | 9 | 8 | 9 |
| L05 | 7 | 10 | 8 | 8 |
| L09 | 7 | 10 | 8 | 9 |
| L04 | 8 | 10 | 8 | 8 |
| L08 | 9 | 9 | 8 | 9 |
| L06 | 6 | 9 | 8 | 6 |
| L03 | 4 | 9 | 8 | 7 |
| L07 | 6 | 9 | 8 | 7 |
| L12 | 3 | 9 | 9 | 4 |
| L10 | 6 | 9 | 7 | 8 |
| L11 | 3 | 9 | 9 | 4 |

### 17.5 Top three concepts and alternative mechanisms

#### First: TallyBridge — reconcile what was handled with what the office records

**Two sides:** Physical receiving/tally staff and the documentation/operations desk.

**Mechanism A: unit-aware receiving worksheet.** Handler records observed groups and units; the tool compares only a sufficiently complete quantity in the same unit as the manifest. This removes a representation mismatch. Lowest complexity; a carefully designed spreadsheet is the main alternative.

**Mechanism B: discrepancy case with a recheck loop.** A count mismatch creates a precise case with source, units, evidence, owner, and question. The office requests a specific recheck; the handler submits a new observation; the office reviews that revision. This coordinates action beyond calculating a difference.

**Mechanism C: joint handover snapshot.** Sender and receiver independently enter counts, then inspect the mismatch and acknowledge observations or disagreement. Stronger custody context, but more adoption effort and identity requirements. Avoid presenting it as a signed legal record.

**Recommended combination:** A small version of A + B. Do not add C until the first interaction is validated.

**Closest alternatives:** Existing terminal/warehouse receiving and discrepancy functions, a structured spreadsheet, or a configured work-order platform. Kaleris and CargoWise demonstrate that substantial operating software already exists [PS9](#ps9), [PS11](#ps11). Their detailed tally functions were not tested. We cannot claim they lack this feature.

**Why build anyway?** For the hackathon, the transformation is clear and testable. For a real product, only proceed if a specific operator has a handoff outside or poorly served by its existing tools. “Enterprise tools are too expensive” is not an established finding here.

#### Second: HoldRelay — turn a blocked case into a verified correction

**Two sides:** The desk issuing an exception and the dispatcher/forwarder responsible for resolving it.

**Mechanism A: issuer-authored correction receipt.** The issuing desk supplies the exact reason, required replacement, next owner, and verification route. This translates institutional shorthand into action.

**Mechanism B: accepted-resolution handoff.** The receiving party explicitly accepts responsibility, submits the correction, and waits for the original desk to review it. This fixes the ownership gap.

**Mechanism C: small deterministic dependency map.** The case shows which human-reviewed prerequisites remain unresolved and which source controls each one. This makes coordination visible, but must not become an unofficial “cargo cleared” decision.

**Smallest credible version:** A + B for one synthetic document-reference mismatch. Three roles at most: issuing desk, correcting party, dispatcher.

**Strongest objection:** Logward explicitly advertises exception handling and cross-party workflows [PS10](#ps10); port-community products already provide status and follow-up actions. A generic ticket with an owner is insufficient differentiation.

**Choose this over TallyBridge when:** A port, depot, or forwarding contact can show a recent case whose delay came specifically from an unclear correction or unaccepted ownership.

#### Third: DepotDelta — keep an empty-return instruction and trip plan aligned

**Two sides:** Authorized instruction issuer and the dispatcher/driver executing the return.

**Mechanism A: latest-instruction card.** Source-linked instruction version is the single view; obsolete versions are visibly superseded. Simplest, but mostly an information-presentation improvement.

**Mechanism B: changed-field acknowledgement.** A depot or time-window change requires the dispatcher and driver to review the changed fields, rather than acknowledge the whole message blindly.

**Mechanism C: pre-departure recheck.** The driver requests confirmation of the instruction and its source before travel. Missing or stale evidence remains unknown; no automatic depot acceptance.

**Smallest credible version:** A + B with a manually entered, clearly synthetic authorized instruction. Phone and desktop views can show the changed destination and acknowledgement.

**Strongest objection:** Dispatch/port systems may already do this, and without a real authorized source the product cannot know which instruction is valid.

**Choose this when:** A carrier/depot contact can provide a documented last-instruction problem and explain the existing authorization and communication process.

### 17.6 Recommendation: build TallyBridge, subject to one local validation gate

**One-sentence problem:** Cargo handling staff and administrative staff can record the same shipment using different units and incomplete observations, making it difficult to distinguish a real discrepancy from a reporting mismatch and agree on the next check.

**Exact initial user:** A receiving/tally clerk and a documentation supervisor handling one general-cargo receiving job. Start with non-hazardous, countable training cargo. This is not a container-yard optimization system.

**Key insight:** A quantity is not merely a number. It needs an item/group identity, unit, completeness state, observation source, and revision. “3 pallets received” cannot automatically be compared with “24 cartons expected.”

**What makes this a bridge:** It converts a field observation into a comparable, reviewable administrative fact—and sends a precise recheck back to the person who can perform it.

#### A complete example

1. **Office input:** Synthetic job `DEMO-CARGO-042`, manifest revision 1, **24 cartons expected**.
2. **Field input:** **3 pallets received; carton count not yet complete**.
3. **First output:** **Not comparable yet.** Pallets and cartons are different units. No fabricated shortage is calculated.
4. **Completed field count:** Pallet A: 8 cartons; B: 8; C: 6. The clerk marks the submitted carton tally complete for the stated receiving scope.
5. **Comparison:** 22 counted cartons versus 24 expected. Output: **2-carton discrepancy reported; review required.** The app has not established theft, loss, or liability.
6. **Administrative action:** Supervisor requests **“Check for loose cartons in the unloading area”** and assigns the recheck to the tally clerk.
7. **New observation:** Two loose cartons are found and recorded as a distinct group. A new tally revision totals 24.
8. **Review:** Supervisor checks the new observation and closes this internal quantity-reconciliation case. The older count and review remain superseded.

**Outcome:** Both sides see how the quantity was derived and what changed. This is an internal count reconciliation—not customs release, a legal document amendment, or permission to move cargo.

#### What must not be inferred

- Three pallets do not imply a fixed carton count. No conversion is allowed merely because a template says “usually eight per pallet.”
- A sealed group's declared contents are not a physically verified count. Keep declared quantity separate from observed quantity.
- A photo is supporting context, not automatic proof of contents, time, authenticity, or responsibility.
- A blank or incomplete count is not zero. An unknown is not a discrepancy of zero.
- A tally clerk's observation is attributed to that clerk; the app cannot independently verify it.
- Matching totals do not prove correct item identity, condition, custody, or compliance.

#### Minimum viable product: five features

1. **Expected quantity card:** Job ID, expected unit/count, document reference, manifest revision, and source label. Manual entry from a synthetic example is enough.
2. **Field tally:** Group IDs, observed quantities and units, count completeness, optional note/photo, and clerk label. Correction replaces an earlier observation for the same group rather than adding a duplicate.
3. **Comparison rules:** Only compare the same declared quantity type and unit; reject impossible/negative counts; flag duplicate group IDs; keep incomplete totals explicitly incomplete.
4. **Recheck loop:** Administrative reviewer names the mismatch, owner, and next question; field clerk responds with a new observation/revision.
5. **Current reconciliation summary:** Expected quantity, observed total, remaining difference, evidence/source links, next actor, and review state. Changes invalidate the previous review.

**The primary action:** Turn an ambiguous receiving note into a precise discrepancy or an explicitly incomplete observation, then request and review the next check.

#### The complete journey

**Open job → read expected count → enter field observations → see comparable/incomplete/discrepant status → office requests recheck → field submits corrected/new observation → office reviews current revision → export summary.**

The two role views should make the handoff obvious. The field view needs large controls and short labels. The office view needs the source, units, difference, and current question—not a dashboard of charts.

If information is missing, show what is missing. If units differ, stop the comparison. If the discrepancy remains, keep the case open or explicitly escalated. Never automatically alter the expected manifest to make it match a tally.

#### Implementation architecture

**Recommended:** React + Vite for the two role views; a small Node/Express service for a shared local demo record; in-memory job/evidence revisions; browser print or copy for the summary. Use the team's familiar equivalents if they reduce setup.

The two browser tabs use the same local service, so a handler entry genuinely appears in the office view after refresh or simple polling. No realtime infrastructure is needed. The local server can run without venue internet once dependencies and assets are installed.

**Storage limit:** In-memory demo data survives page reload but not a server restart. Include an explicit reset/reseed control for synthetic cases. Persistent storage is optional after the core passes; do not claim durable records before implementing it.

**Revision rule:** Each office review refers to both the current manifest revision and current tally revision. A stale review request is rejected or returned for review if either changes. The single-process server must apply the check and update together. This matters more than animations.

**No essential external service:** No OCR, image recognition, shipping API, LLM, customs API, or terminal integration. Uploading a photo should be optional; manual input preserves the bridge if uploads fail.

**Demonstration identity:** Role labels are synthetic, not authenticated signatures. A production system would require access control, durable records, operator-approved workflows, and appropriate integration. Those are outside the hackathon claim.

#### Highest-risk assumption and early test

**Product risk:** The real operator may already record units, counts, discrepancies, and reviews in its operating system with no painful rekeying. If so, this idea lacks an unmet need at that site.

Ask a tally clerk, freight operator, warehouse/terminal documentation worker, or knowledgeable logistics practitioner:

1. “Show us a recent discrepancy and every step from physical observation to office resolution.”
2. “What did each count mean—cartons, pallets, items, weight, or declared contents?”
3. “Where was information copied, misunderstood, or missing?”
4. “What did the existing system already capture? Could a configuration change solve this?”
5. “Who requested the recheck, and what allowed the case to close?”

**Decision gate:** Continue only if the contact can identify a meaningful handoff failure that the proposed fields and recheck loop address. If they instead describe ownership delays with adequate quantities, prefer HoldRelay. If no domain contact is reachable, disclose that the prototype demonstrates a hypothetical workflow, not validated port demand.

#### Essential test cases

- 3 pallets versus 24 cartons → **not comparable**, not “21 missing.”
- Incomplete carton tally → **count incomplete**, not a finalized shortage.
- Complete counts 8 + 8 + 6 versus 24 cartons → **2-carton discrepancy**.
- Re-entering group C replaces its prior revision; it does not double-count C.
- Add a distinct loose-carton group of 2 → total 24; old office review is no longer current.
- Change the expected manifest revision → comparison and review require checking again.
- Negative counts, duplicate IDs, and unclear units → specific errors that preserve entered data.
- Unresolved discrepancy → no automatic “reconciled,” “cleared,” or “safe to dispatch” state.

### 17.7 Plans for the two rounds

These plans replace the PointBack-specific plans when pursuing the port direction. They retain the same five-hour selection window and additional 12–15-hour build window.

#### Round 1: five hours

| Time | Work | Output |
|---|---|---|
| 0:00–0:45 | Seek one concrete operations/admin case; separate observation from assumption | One real workflow account if available; otherwise a clearly synthetic case and explicit evidence gap |
| 0:45–1:15 | Compare TOS/WMS, spreadsheets, Portbase, and exception tools | Precise boundary and reason an existing configuration may be insufficient |
| 1:15–1:45 | Choose TallyBridge or a better-evidenced alternative; lock units and review rules | Five-field tally sketch, manifest example, state transitions, exclusion list |
| 1:45–2:45 | Prepare a small proof of quantity comparison and revision invalidation | Working “units differ → incomplete → discrepancy → recheck” flow if feasible; otherwise label a wireframe honestly |
| 2:45–3:30 | Test with available participants; consult the domain contact if possible | Correct handling of mixed units and missing counts; feedback is attributed accurately |
| 3:30–4:20 | Build six-slide story and record a backup | Problem, existing alternatives, bridge, proof, scope, and validation plan |
| 4:20–5:00 | Rehearse, challenge claims, and submit | Timed demo; honest novelty answer; working local artifact |

**What judges need to see:** A physical count becoming an actionable administrative discrepancy, and a human recheck updating that exact case. They should not have to imagine a future port API to see the central mechanism.

#### Round 2: twelve-hour core

| Time | Build | Done when |
|---|---|---|
| 0:00–1:00 | Lock quantity types, group IDs, completeness, and revision rules | Expected/observed/declared values are distinct; no unsupported conversion |
| 1:00–2:30 | Implement comparison and stale-review protection first | Mixed units, incomplete counts, duplicates, and changed revisions behave correctly |
| 2:30–4:30 | Build field and office views with shared local service | A new field entry appears in the office view; manual refresh is sufficient |
| 4:30–6:00 | Implement discrepancy assignment and recheck response | One person requests a specific check; the other submits a new observation |
| 6:00–7:00 | Add current summary and reset; optional photo only if easy | Summary uses current data; text-only workflow works end to end |
| 7:00–8:30 | Test edge cases and seek domain feedback | Eight essential cases above pass; limitations are documented |
| 8:30–9:30 | Improve field usability, labels, and error states | Both roles can complete a novel synthetic case without a guided script |
| 9:30–10:30 | Package app and test local network-free operation | Both tabs run against local service with internet disconnected |
| 10:30–12:00 | Freeze, rehearse, record backup, fix actual failures | Three-minute demo and clear reset work repeatedly |

**Optional hours 12–15:** Additional domain/user feedback first; then simple persistence or remote deployment if already familiar; finally visual polish. Do not add integrations or AI.

**Scope fallback:** Remove photo upload, formatted export, automatic polling, and decorative timelines. Keep manual entry, compatible-unit comparison, incomplete-state handling, recheck, and current-revision review. Those five elements are the product.

### 17.8 Three-minute demonstration

#### 0:00–0:25 — Establish the gap

Show a synthetic manifest with **24 cartons** and a receiving slip with **3 pallets**.

Say: “The office needs to know whether 24 cartons arrived. The field note says three pallets. Both records can be accurate and still fail to answer the same question.”

#### 0:25–0:55 — Preserve the meaning of the observation

Open the job. Enter three pallets and mark carton counting incomplete.

Output: **Not comparable yet: expected cartons, observed pallets.**

Say: “We preserve the units and uncertainty. We do not subtract pallets from cartons or guess a packing conversion.”

#### 0:55–1:25 — Turn the completed count into a precise discrepancy

Enter counted cartons for the three groups: **8, 8, 6**. Mark the tally complete for this receiving job.

Output: **22 counted / 24 expected / 2-carton discrepancy / review required**.

Say: “Now the office receives a specific observation with its source and counting basis—not just ‘cargo short.’”

#### 1:25–1:55 — Send an actionable question back

In the office view, request **“Check unloading area for loose cartons”** and assign the tally clerk.

In the field view, show the actual task and submit a new group: **2 loose cartons found**.

Say: “The tool closes the communication loop with the person who can perform the check.”

#### 1:55–2:25 — Review the new version

The total becomes **24**, but the previous office review is superseded. Reviewer checks the new observation and records **Internal quantity reconciliation complete**.

Say: “Changed evidence needs another review. Matching totals alone do not authorize release or establish cargo condition.”

#### 2:25–3:00 — Differentiate honestly and state the limit

Show the concise summary: expected count, observed groups, discrepancy history, recheck, current review.

Say: “Terminal systems and spreadsheets already handle much of this. Our prototype focuses on a handoff where units, incomplete observations, and rechecks get lost. This is synthetic cargo and a working coordination prototype; local usefulness still needs validation. No AI or live port API is required.”

**Backup:** Run the service locally, bundle sample inputs, and keep a short recording. If uploads fail, use text observations. If the app fails, identify the recording openly rather than implying it is live.

### 17.9 Thirty-second pitch

> A port office works with manifests; a handling team works with pallets, cartons, and partial counts. Those records can describe the same cargo without answering the same question. TallyBridge preserves units and uncertainty, turns a completed count into a specific discrepancy, and sends a recheck to the person who can resolve it. Updated evidence needs a new review. We demonstrate that handoff with synthetic cargo, without pretending to issue clearance or replace a terminal operating system.

### 17.10 Questions a skeptical judge should ask

#### “Isn't this already in terminal or warehouse software?”

Often, yes. Existing systems are the first alternative to examine. The product case depends on finding a particular handoff outside or poorly served by them. Without that finding, this is a focused hackathon demonstration, not an established market gap.

#### “Why not use a spreadsheet?”

A well-designed spreadsheet may be enough. The proposed advantage is preserving incomplete/different-unit states, the source of observations, and the request/recheck/review lifecycle in one interaction. Compare it with a structured spreadsheet, not a deliberately weak one.

#### “How do you know the physical count is correct?”

We do not. It is a human-attributed observation. The tool preserves its scope, completeness, evidence, and revision so a reviewer can decide what to recheck. No computer vision or automatic truth claim is involved.

#### “What happens when a pallet contains an unknown number of cartons?”

It remains an unknown carton quantity. A declared packing count can be shown separately but is not relabeled as physically verified. The tool must not invent a conversion.

#### “Does this change official shipping documents or clear cargo?”

No. It produces an internal discrepancy/reconciliation record. Authorized personnel and official systems remain responsible for document amendments, release, and movement decisions.

#### “What is genuinely implemented?”

The tally, compatible-unit comparison, discrepancy state, recheck request/response, shared record, and stale-review rules. The cargo, manifests, staff roles, and facility are synthetic. There is no claimed live terminal integration.

#### “Why is this better than your earlier idea?”

For the requested domain, the bridge is directly between physical handling and administrative representation. It offers a visible transformation and a reciprocal task, while remaining independent of unavailable official data. This is a better domain fit; it is not proof of stronger validated demand.

#### “What would make you abandon it?”

A local operator shows that its existing system already handles the full interaction effectively, the problem is actually inaccurate physical counting rather than a handoff, or the new workflow adds duplicate entry without reducing uncertainty.

### 17.11 Risks, judging outlook, and exclusions

**Strongest judging qualities:** Theme fit, visible physical/digital transformation, simple arithmetic with careful semantics, a meaningful human review loop, and a reliable local demo.

**Biggest weaknesses:** Unvalidated local demand; uncertain differentiation from configured operating software; possible duplicate work; difficulty proving accurate observations; and no real production access controls or integrations.

**Prospective ratings, not achieved results:** Problem importance 8/10; theme fit 10; bridge clarity 9; originality 6; UX 7 target; technical execution 7 target; feasibility 9; reliability 8 target; demo 9; practical usefulness 7 pending validation; future development 7. Do not use the estimated 83.0 opportunity score as a measured user-impact result.

**Essential improvements:** A real workflow example; a clear current-tool comparison; correct units/incomplete states; no stale review; a useful recheck; and an honest demo.

**Optional polish:** Phone-sized field layout, photo attachment, PDF styling, remote hosting, and extra cargo examples.

**Explicitly avoid building:**

- A port-wide ERP, terminal operating system, or generic cargo dashboard.
- Live vessel tracking, berth optimization, crane allocation, or route optimization.
- An AI customs agent, automatic clearance, document authenticity claims, or legal compliance determination.
- Automatic cargo release, payment, access credentials, or container collection authorization.
- Computer-vision counting, automatic damage detection, or liability assignment.
- Dangerous-goods, loading, lifting, stowage, or reefer-control recommendations.
- Arbitrary conversion between packages, weight, volume, and item count.
- Unsupported claims of reduced demurrage, emissions, fraud, accidents, or port congestion.
- Full multilingual translation, complex offline synchronization, blockchain, or production signatures.

### 17.12 Port research sources and limits

Retrieved **17 October 2026**. These sources verify the existence and advertised scope of systems/standards; they do not independently validate TallyBridge, prove a local adoption gap, or establish a cost advantage. No product accounts, implementation manuals, or port operations were directly tested.

#### PS1

[IMO: Maritime Single Window](https://www.imo.org/en/OurWork/Facilitation/Pages/MaritimeSingleWindow-default.aspx)

Defines the ship/public-authority information exchange and the 2024 requirement. This must not be extended into a claim that every cargo-release step is unified.

#### PS2

[DCSA: Port Call Standard](https://dcsa.org/standards/port-call)

Standardized communication for coordinated port-call services and operational timing. Evidence that port-call coordination is an established field.

#### PS3

[DCSA: Track & Trace](https://dcsa.org/standards/track-and-trace)

Standardized shipment, transport, equipment, and other event exchange. Evidence against claiming generic tracking/interoperability as novel.

#### PS4

[DCSA: Electronic Bill of Lading](https://dcsa.org/standards/bill-of-lading)

Existing standardization and API work for electronic shipping documents. Not an API integration implemented by this prototype.

#### PS5

[Portbase: Cargo Controller](https://www.portbase.com/en/services/cargo-controller/)

Advertised consolidated cargo/customs/unloading information, exceptions, and follow-up actions. Product account and configuration were not tested.

#### PS6

[Portbase: Secure Chain](https://www.portbase.com/en/secure-chain/)

Digital transfer of container collection rights through authorized participants. Demonstrates why a student checklist cannot substitute for release authority.

#### PS7

[Portbase: Hinterland Container Notification Road](https://www.portbase.com/en/services/hinterland-container-notification-road/)

Truck/visit pre-notification, status feedback, and slot requests at participating facilities. Strong overlap with generic pickup-readiness concepts.

#### PS8

[Port of Los Angeles: Port Optimizer](https://www.portoflosangeles.org/business/supply-chain/port-optimizer)

Established supply-chain information portal and operational visibility. Do not claim all ports lack consolidated data.

#### PS9

[CargoWise: solutions](https://www.cargowise.com/solutions/)

Advertised forwarding, customs, warehouse, and landside logistics capabilities. Detailed receiving/tally configurations were not verified.

#### PS10

[Logward](https://www.logward.com/)

Explicitly advertises stakeholder workflows and exception handling. A direct challenge to generic administrative-exception novelty claims.

#### PS11

[Kaleris](https://kaleris.com/)

Advertises terminal operating, yard, and execution systems. Detailed discrepancy functionality was not tested; absence of that feature is not asserted.

#### PS12

[IMO: IMO/ILO/UNECE CTU Code](https://www.imo.org/en/OurWork/Safety/Pages/CTU-Code.aspx)

Describes an established handling/packing guidance framework. It supports leaving approved operational procedures with qualified participants; it is not a set of automatically applied rules in the proposed app.

**India-specific limitation:** Attempts to retrieve the NLP Marine domain and Indian Ports Association site were unsuccessful in this session. No claims about current Indian-port integrations, API availability, regulations, or mandatory local documents are based on those failed requests. Confirm the selected country's and facility's actual workflow before making jurisdiction-specific claims.

**Recommended next decision:** Find one actual tally-to-office discrepancy and trace it end to end. If quantities and units are already captured well but no one owns the remedy, choose HoldRelay. If both are already handled, seek a different boundary rather than adding a new dashboard.
