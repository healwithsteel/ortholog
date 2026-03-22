// OrthoLog Coding Academy — Scenario Library
// De-identified real-world coding scenarios for resident training
// Created by Galadriel for Dr. Karl F. Siebuhr

export const MODIFIERS = {
  'AS': { name: 'Assistant Surgeon (PA-C)', desc: 'PA-C or NP assists at surgery. Appended to the primary CPT code billed by the assistant.' },
  '22': { name: 'Increased Procedural Services', desc: 'When work required is substantially greater than typically required. Must document WHY in the op note (e.g., morbid obesity, excessive scarring, unusual anatomy).' },
  '59': { name: 'Distinct Procedural Service', desc: 'Indicates a procedure is distinct and independent from other services on the same day. Used to bypass NCCI bundling edits when procedures are truly separate.' },
  '62': { name: 'Two Surgeons', desc: 'Two surgeons, each performing a distinct portion of a procedure. Each bills the same CPT with -62. Requires separate op notes.' },
  '76': { name: 'Repeat Procedure by Same Physician', desc: 'Same procedure repeated on the same day by the same surgeon (e.g., return to OR for same fracture).' },
  '77': { name: 'Repeat Procedure by Different Physician', desc: 'Same procedure repeated by a different surgeon on the same day.' },
  '78': { name: 'Unplanned Return to OR', desc: 'Return to OR for a related procedure during the postop period. Restarts a new postop global period.' },
  '79': { name: 'Unrelated Procedure During Postop Period', desc: 'New procedure unrelated to the original during the postop global period. Common in trauma — new injury during recovery from prior surgery.' },
  'LT': { name: 'Left Side', desc: 'Procedure performed on the left side.' },
  'RT': { name: 'Right Side', desc: 'Procedure performed on the right side.' },
  '50': { name: 'Bilateral Procedure', desc: 'Same procedure performed on both sides. Reimbursed at 150% of the single-side rate.' },
  '57': { name: 'Decision for Surgery', desc: 'E/M service resulted in the initial decision for surgery. Use on the E/M code, not the surgical code.' },
  '25': { name: 'Significant, Separately Identifiable E/M', desc: 'E/M service on the same day as a procedure, above and beyond the usual pre/post work for the procedure.' },
  '58': { name: 'Staged or Planned Procedure', desc: 'A procedure performed during the postop period that was planned at the time of the original procedure.' },
  '80': { name: 'Assistant Surgeon (MD)', desc: 'A physician assistant surgeon. Different from AS modifier which is for PA-C/NP.' },
}

export const CODING_CONCEPTS = [
  {
    id: 'bundling',
    title: 'Bundling vs. Unbundling',
    icon: '📦',
    content: `**Bundling** = CMS considers certain procedures inherently part of a larger procedure. You can't bill them separately.

**Example:** You can't bill wound closure (12001-12007) separately when it's part of an ORIF — closing the incision is included in the surgical code.

**Unbundling** = Correctly billing procedures separately when they ARE distinct services with separate medical necessity.

**Example:** ORIF medial malleolus (27766) + ORIF lateral malleolus (27784) = two separate fractures, two separate fixation procedures, two separate codes. This is NOT bundling — these are distinct procedures.

**The Rule:** If two procedures share the same incision, same fracture, same anatomic site — they're usually bundled. If they have different diagnoses, different incisions, different anatomic sites — they can likely be billed separately.

**NCCI Edits:** CMS publishes the National Correct Coding Initiative (NCCI) edit pairs. Before billing two codes together, check if they're an NCCI pair. If they are, you need modifier -59 to prove they're distinct.

**Pro Tip:** When in doubt, check the NCCI lookup tool: https://www.cms.gov/medicare-coding/ncci-editing`
  },
  {
    id: 'modifiers',
    title: 'Modifier Masterclass',
    icon: '🏷️',
    content: `**Modifiers tell the payer HOW you did the procedure, not WHAT you did.**

**The Big 5 for Ortho:**

**-AS (Assistant Surgeon — PA-C/NP)**
Your PA-C scrubs in and assists? They bill the same CPT with -AS. Pays at 13.6% of the Medicare fee. Sounds small, but across 12 cases/week, it adds up fast.

**-59 (Distinct Procedural Service)**
The "unbundling" modifier. Use when two procedures that are normally bundled are actually separate services. MUST have documentation supporting why they're distinct (different incision, different diagnosis, different anatomic site).

**-22 (Increased Procedural Services)**
The case was WAY harder than usual. Morbid obesity. Prior hardware removal. Severe comminution requiring extended reconstruction. You MUST document the additional work in the op note. Typical additional reimbursement: 20-30% above base.

**-78 (Unplanned Return to OR)**
Patient goes back to the OR during the 90-day global period for a RELATED complication. Key: this resets the global period clock.

**-79 (Unrelated Procedure During Postop)**
New surgery during the 90-day global period for a DIFFERENT problem. Hip fracture patient who falls and breaks their wrist 3 weeks later = -79 on the wrist ORIF.

**Common Mistakes:**
- Forgetting -AS on every case the PA-C scrubs
- Using -59 when procedures are truly bundled (= fraud risk)
- Not documenting the extra work when using -22
- Confusing -78 (related) vs -79 (unrelated) returns to OR`
  },
  {
    id: 'documentation',
    title: 'Medical Necessity Documentation',
    icon: '📝',
    content: `**If it's not documented, it didn't happen. And if it didn't happen, you can't bill for it.**

**What Every Op Note Needs for Billing:**
1. **Diagnosis** — specific ICD-10 code(s) with laterality
2. **Medical necessity** — WHY this patient needs THIS procedure
3. **Procedure description** — what you actually did, step by step
4. **Implants used** — type, manufacturer, size
5. **Complications** — any unexpected findings or difficulties
6. **Assistant** — who assisted and how (if billing -AS)

**For -22 Modifier (extra work), document:**
- What made this case harder than typical
- How much additional time/effort was required
- Specific obstacles encountered (obesity, prior hardware, unusual anatomy)
- Include a comparison: "This procedure typically takes 60 minutes; due to [reason], this case required 120 minutes"

**For Separate Procedures (unbundling), document:**
- Separate diagnosis for each procedure
- Separate incision (if applicable)
- Why each procedure was medically necessary independently
- Different anatomic site or structure

**Red Flags Auditors Look For:**
- -22 modifier without documentation of unusual circumstances
- -59 modifier without separate diagnoses
- Bilateral procedures without documented bilateral pathology
- E/M on the same day as surgery without -57 or -25
- Hardware removal billed separately when it's part of the revision`
  },
  {
    id: 'common-traps',
    title: 'Common Coding Traps',
    icon: '⚠️',
    content: `**These mistakes cost practices tens of thousands annually.**

**Trap 1: Forgetting the fibula**
Ankle fracture with medial + lateral malleolus fixation? That's TWO codes: 27766 (medial) + 27784 (lateral). Many residents code it as a single bimalleolar (27814) and leave money on the table.

**Rule:** If you fixed them through SEPARATE incisions, bill them separately.

**Trap 2: Missing hardware removal**
Taking out old hardware before placing new? 20680 (hardware removal) can be billed IN ADDITION to the new fixation — IF it required a separate incision or significant additional work.

**Trap 3: Undercoding trauma**
27507 (ORIF femoral shaft with IM device) pays more than 27506 (ORIF femoral shaft). If you used a nail, code the nail code.

**Trap 4: Forgetting the -AS modifier**
Every single case your PA-C scrubs = AS modifier = 13.6% of Medicare rate = money. At 12 cases/week, that's roughly $2,500-4,000/month in assistant fees.

**Trap 5: Not billing the E/M separately**
You see a consult in the ED, decide to operate, and take them to the OR the same day. The ED consult is a separate, billable E/M service with -57 modifier (decision for surgery).

**Trap 6: Global period confusion**
90-day global period starts on the day of surgery. ALL related E/M visits are included. But a NEW injury = new problem = billable with -79 on the new procedure.

**Trap 7: Wound care bundling**
Wound debridement, closure, and VAC placement are usually bundled into the surgical code. Exception: if you do a SEPARATE debridement procedure on a different wound, that's billable.`
  },
  {
    id: 'revenue-optimization',
    title: 'Revenue Optimization (Legal & Ethical)',
    icon: '💰',
    content: `**This is NOT about upcoding. It's about not leaving legitimate work on the table.**

**1. Always bill the most specific code available.**
27506 (ORIF femoral shaft) vs 27507 (ORIF femoral shaft with IM device). If you used a nail, bill the nail code. They're different procedures with different RVUs.

**2. Separate distinct procedures with distinct diagnoses.**
Ankle fracture: if you fixed the medial and lateral malleolus through separate incisions, bill 27766 + 27784, not just 27814. Two incisions, two fixation constructs, two codes.

**3. Document assistant work consistently.**
PA-C billing with -AS requires documentation that the PA-C was present and actively assisting. Make sure every op note mentions the assistant by name and role.

**4. Use -22 when justified.**
Don't be afraid of it. If a hip fracture in a 350-pound patient took twice as long as expected with significant technical challenges — document it and use -22. The extra 20-30% reimbursement is earned.

**5. Bill E/M services with decision for surgery.**
ED consult → decision to operate → -57 on the E/M code. This is a separate service. Don't give it away.

**6. Track your RVUs.**
Know what each case pays. Know your top-generating procedures. Know where you're leaving money. OrthoLog's RVU tracker exists for exactly this reason.

**7. Don't ignore bilateral cases.**
Bilateral modifier -50 pays 150% of the unilateral rate. If you fixed both wrists, bill it bilateral. Don't bill two separate codes at 100% each — -50 is the correct way and it's cleaner.

**The Bottom Line:** Conservative but complete coding. Never upcode. Never bill for work you didn't do. But ALWAYS bill for work you DID do. The gap between fraud and optimization is documentation.`
  },
]

export const CODING_SCENARIOS = [
  // === INTERN LEVEL ===
  {
    id: 'sc1',
    difficulty: 'intern',
    title: 'Hip Fracture — Basic CMN',
    scenario: 'An 82-year-old female presents to the ED after a ground-level fall. X-rays show a displaced intertrochanteric femur fracture (AO 31-A2). Taken to OR for cephalomedullary nail fixation. Jon Kletter PA-C assists. Straightforward case, 55 minutes.',
    correctCodes: [
      { code: '27245', desc: 'ORIF intertrochanteric fracture with plate/screw implant', primary: true },
    ],
    correctModifiers: ['AS'],
    correctDiagnoses: ['S72.141A — Displaced intertrochanteric fracture of right femur, initial encounter'],
    explanation: `**Why 27245 and not 27244?** 
27245 specifically includes "with intramedullary implant" (CMN). 27244 is for plate/screw fixation. The implant type determines the code.

**Why -AS?** Jon Kletter PA-C scrubbed and assisted. The PA-C bills the same code (27245) with -AS modifier at 13.6% of Medicare rate.

**Common mistake:** Coding 27244 instead of 27245. They're different RVUs. Always match the code to the implant.`,
    distractors: [
      { code: '27244', desc: 'ORIF intertrochanteric femur fracture', why: 'This is for plate/screw fixation, NOT intramedullary nail' },
      { code: '27236', desc: 'ORIF proximal femur fracture', why: 'This is for femoral neck fractures, not intertrochanteric' },
      { code: '27507', desc: 'ORIF femoral shaft with IM device', why: 'Wrong anatomic location — this is for shaft fractures, not intertrochanteric' },
    ],
  },
  {
    id: 'sc2',
    difficulty: 'intern',
    title: 'Distal Radius — Volar Plate',
    scenario: 'A 55-year-old male slipped on ice and fell on an outstretched hand. X-rays show a displaced distal radius fracture (Frykman VIII). ORIF with volar locking plate through a volar (Henry) approach. PA-C assists. 45 minutes.',
    correctCodes: [
      { code: '25607', desc: 'ORIF distal radius fracture', primary: true },
    ],
    correctModifiers: ['AS'],
    correctDiagnoses: ['S52.501A — Unspecified fracture of the lower end of right radius, initial encounter'],
    explanation: `**25607** is the workhorse code for distal radius ORIF. Whether you use a volar plate, dorsal plate, or fragment-specific fixation — it's the same code.

**Key:** The approach (volar vs dorsal) doesn't change the CPT code. The code describes what was fixed, not how you got there.

**Don't forget -AS** for the PA-C assistant.`,
    distractors: [
      { code: '25609', desc: 'ORIF distal radius with ulnar styloid fixation', why: 'Only use this if you ALSO fixed the ulnar styloid as a separate procedure' },
      { code: '25606', desc: 'Percutaneous skeletal fixation of distal radius', why: 'This is for percutaneous pinning, not ORIF with plate' },
      { code: '25515', desc: 'ORIF radial shaft fracture', why: 'Wrong location — shaft, not distal' },
    ],
  },
  {
    id: 'sc3',
    difficulty: 'intern',
    title: 'Ankle Fracture — Lateral Only',
    scenario: 'A 34-year-old male twisted his ankle playing basketball. X-rays: isolated displaced lateral malleolus fracture (Weber B). ORIF with plate and screws through a lateral approach. No PA-C assistance. 40 minutes.',
    correctCodes: [
      { code: '27792', desc: 'ORIF distal fibula fracture', primary: true },
    ],
    correctModifiers: [],
    correctDiagnoses: ['S82.61XA — Displaced fracture of lateral malleolus of right fibula, initial encounter'],
    explanation: `**27792** is for isolated lateral malleolus / distal fibula ORIF. Simple, clean, one code.

**No -AS** because no assistant was used.

**Key distinction:** 27792 (distal fibula) vs 27784 (lateral malleolus). These overlap but 27792 is more commonly used for isolated distal fibula fractures. Either is acceptable — consistency matters.

**Watch for:** If there's also syndesmotic instability and you place syndesmotic screws, that may be separately billable (27829).`,
    distractors: [
      { code: '27784', desc: 'ORIF lateral malleolus fracture', why: 'Also acceptable for this case — essentially the same procedure. Know your practice preference.' },
      { code: '27814', desc: 'ORIF bimalleolar ankle fracture', why: 'This is for bimalleolar fractures — this patient only has a lateral malleolus fracture' },
      { code: '27540', desc: 'ORIF proximal fibula/shaft fracture', why: 'Wrong location — this is proximal fibula, not distal' },
    ],
  },

  // === SENIOR LEVEL ===
  {
    id: 'sc4',
    difficulty: 'senior',
    title: 'Trimalleolar Ankle — Separate Fixation (No Posterior Hardware)',
    scenario: 'A 67-year-old female falls and sustains a trimalleolar ankle fracture. Through a lateral incision, you plate the fibula. Through a separate medial incision, you fix the medial malleolus with two screws. The posterior malleolus fragment is small and reduces with ligamentotaxis — no separate posterior fixation is performed. 75 minutes.',
    correctCodes: [
      { code: '27766', desc: 'ORIF medial malleolus fracture', primary: false },
      { code: '27792', desc: 'ORIF distal fibula fracture', primary: true },
    ],
    correctModifiers: ['59'],
    correctDiagnoses: [
      'S82.61XA — Displaced fracture of lateral malleolus',
      'S82.51XA — Displaced fracture of medial malleolus',
    ],
    explanation: `**This is the classic unbundling example.** Two separate fractures, two separate incisions, two separate fixation constructs = two separate codes.

**Why not 27822 or 27823 (trimalleolar)?** Because you fixed the medial and lateral through SEPARATE incisions with separate hardware. The trimalleolar code (27822/27823) is for when you approach everything through fewer incisions.

**-59 modifier** goes on the second code (27766) to indicate it's a distinct procedural service from the primary (27792).

**Posterior malleolus:** You didn't separately fix it — it reduced with ligamentotaxis. If you had placed separate screws through a posterior approach, you'd add 27769.

**Why no -AS?** Assistant at surgery (modifier -AS/-80) is generally NOT payable for ankle fracture ORIF codes (27766, 27792) with most payers including Medicare. The assistant surgery payment indicator for these codes is typically "2" (not payable). Always check the MPFS assistant surgery indicator before billing -AS. Procedures where -AS IS payable include more complex cases like pelvic/acetabular fractures, spine, and revision arthroplasty.

**Revenue difference:** 27822 (trimalleolar) ≈ $1,200. 27792 + 27766 ≈ $1,800. That's $600 left on the table if you code it wrong.`,
    distractors: [
      { code: '27822', desc: 'ORIF trimalleolar ankle fracture', why: 'Undercodes the work — you used TWO separate incisions and TWO separate constructs' },
      { code: '27814', desc: 'ORIF bimalleolar ankle fracture', why: 'Also undercodes — use individual codes when separate incisions/constructs are used' },
      { code: '27769', desc: 'ORIF posterior malleolus fracture', why: 'The posterior malleolus was reduced indirectly — no separate posterior fixation was performed' },
    ],
  },
  {
    id: 'sc5',
    difficulty: 'senior',
    title: 'Return to OR — Hardware Failure',
    scenario: 'A 71-year-old male had ORIF of a proximal humerus fracture 3 weeks ago. Presents with loss of fixation — screws have backed out. Return to OR for hardware removal and revision ORIF with new locking plate. PA-C assists. 90 minutes.',
    correctCodes: [
      { code: '23615', desc: 'ORIF proximal humerus fracture', primary: true },
      { code: '20680', desc: 'Removal of implant, deep', primary: false },
    ],
    correctModifiers: ['78', 'AS'],
    correctDiagnoses: [
      'T84.110A — Breakdown (mechanical) of internal fixation device of right humerus',
      'S42.201A — Unspecified fracture of upper end of right humerus',
    ],
    explanation: `**-78 modifier** is critical here. This is an unplanned return to the OR during the 90-day global period for a RELATED complication (hardware failure).

**20680** (hardware removal, deep) is separately billable because it was a significant procedure — removing failed screws and a plate is not trivial.

**Why not -76?** -76 is for repeating the SAME procedure on the same day. This is a return weeks later during the global period = -78.

**-78 goes on the surgical code (23615)**. It tells the payer: "Yes, I know this is during my global period, but this is a complication requiring a new surgery."

**Revenue impact:** Without -78, the revision gets denied as part of the original global period. The surgeon does the work and gets $0. With -78, it's separately reimbursed.`,
    distractors: [
      { code: '23615', desc: 'ORIF proximal humerus fracture (without -78)', why: 'Without -78, this gets denied as part of the 90-day global period' },
      { code: '23616', desc: 'ORIF proximal humerus fracture with tuberosity', why: 'Different procedure — this includes tuberosity repair' },
    ],
  },
  {
    id: 'sc6',
    difficulty: 'senior',
    title: 'Multi-Trauma — Hip + Wrist Same Day',
    scenario: 'A 45-year-old male in a motorcycle accident sustains a displaced femoral neck fracture (left) AND a displaced distal radius fracture (right). Both require surgical fixation. In a single anesthesia session: CMN fixation of the femoral neck, then volar plating of the distal radius. PA-C assists on both. Total OR time: 2 hours.',
    correctCodes: [
      { code: '27236', desc: 'ORIF proximal femur fracture', primary: true },
      { code: '25607', desc: 'ORIF distal radius fracture', primary: false },
    ],
    correctModifiers: ['LT', 'RT', '59', 'AS'],
    correctDiagnoses: [
      'S72.001A — Fracture of unspecified part of neck of left femur',
      'S52.501A — Unspecified fracture of the lower end of right radius',
    ],
    explanation: `**Two completely separate injuries, two separate body regions, two separate procedures.** Each gets its own code with -59 on the secondary.

**Laterality modifiers:** -LT on the femur code (left hip), -RT on the radius code (right wrist). Always include laterality when applicable.

**-AS on both codes** — the PA-C assisted on the entire case.

**Key point:** These are NOT bundled. Different body regions, different diagnoses, different procedures. -59 on the secondary code (25607) confirms they're distinct services.

**Documentation tip:** In polytrauma cases, clearly describe each procedure separately in the op note. Some surgeons write one combined note — better practice is to document each fixation as a distinct procedure within the note.`,
    distractors: [],
  },

  // === FELLOWSHIP-READY ===
  {
    id: 'sc7',
    difficulty: 'fellowship',
    title: 'Complex Pelvis — The Big One',
    scenario: 'A 38-year-old female in a high-speed MVC. CT shows: anterior column + posterior wall acetabular fracture (left) with associated SI joint disruption. Through an ilioinguinal approach, you fix the anterior column with a pelvic brim plate. Through a separate Kocher-Langenbeck approach, you fix the posterior wall with a buttress plate. SI joint stabilized percutaneously with an iliosacral screw. PA-C assists. Intraoperative cell saver used. 4.5 hours. Estimated blood loss 1,200cc.',
    correctCodes: [
      { code: '27254', desc: 'ORIF acetabular fracture(s)', primary: true },
      { code: '27279', desc: 'Percutaneous arthrodesis of sacroiliac joint', primary: false },
    ],
    correctModifiers: ['LT', '59', 'AS', '22'],
    correctDiagnoses: [
      'S32.431A — Displaced fracture of anterior column of left acetabulum',
      'S32.441A — Displaced fracture of posterior wall of left acetabulum',
      'S33.2XXA — Dislocation of sacroiliac and sacrococcygeal joint',
    ],
    explanation: `**This is peak complexity.** Let's break it down:

**27254 (ORIF acetabular fracture)** covers the acetabular work — both the anterior column and posterior wall fixation. Even though you used two approaches (ilioinguinal + Kocher-Langenbeck), the acetabular fracture is one code. The approaches are the surgical technique, not separate procedures.

**27279 (SI joint fixation)** is SEPARATELY billable with -59 because the SI joint disruption is a distinct injury from the acetabular fracture, requiring separate fixation.

**-22 modifier on 27254** — This case is SUBSTANTIALLY more complex than a typical acetabular ORIF. Two surgical approaches, 4.5 hours, 1,200cc blood loss. Document the additional complexity thoroughly.

**-LT** for laterality on the acetabular code.

**-AS on both codes** for the PA-C.

**What you DON'T bill separately:**
- The two approaches (ilioinguinal + Kocher-Langenbeck) — they're part of the acetabular fixation
- Cell saver — typically included in the OR charge, not a surgeon fee
- The separate plates for anterior vs posterior — one code covers all acetabular fixation

**Revenue with -22:** Base 27254 ≈ $2,100 + 20-30% for -22 = ~$2,500-2,700. Plus 27279 ≈ $800. Plus -AS on both. Total professional fees: ~$3,500-4,000 for this case.`,
    distractors: [
      { code: '27269', desc: 'ORIF of hip socket fracture(s) with internal fixation', why: 'This is essentially the same as 27254 — check your payer preference, but 27254 is more commonly used for complex acetabular patterns' },
      { code: '20680', desc: 'Hardware removal', why: 'No hardware was removed in this case' },
    ],
  },
  {
    id: 'sc8',
    difficulty: 'fellowship',
    title: 'Same-Day Bilateral Ankle Fractures',
    scenario: 'A 55-year-old male falls from a ladder, landing on both feet. Bilateral displaced lateral malleolus fractures (Weber C pattern). Both ankles ORIF with lateral plates in the same anesthesia session. Right side first, then left. PA-C assists. 80 minutes total.',
    correctCodes: [
      { code: '27792', desc: 'ORIF distal fibula fracture', primary: true },
      { code: '27792', desc: 'ORIF distal fibula fracture (contralateral)', primary: false },
    ],
    correctModifiers: ['50', 'AS'],
    correctDiagnoses: [
      'S82.61XA — Displaced fracture of lateral malleolus of right fibula',
      'S82.62XA — Displaced fracture of lateral malleolus of left fibula',
    ],
    explanation: `**Bilateral modifier -50** is the key here. Same procedure, both sides, same session.

**How to bill:** 27792-RT as the primary, then 27792-50 (or 27792-LT depending on payer). Most payers want one line with -50.

**Reimbursement:** Bilateral = 150% of the unilateral rate. So if 27792 pays $1,000 → bilateral pays $1,500.

**Common mistake:** Billing 27792-RT and 27792-LT as two separate line items at full rate (200%). Some payers will pay it, but Medicare and most commercial will reduce to 150%. Bill correctly upfront.

**-AS on the bilateral code** — PA-C assisted on both.

**Documentation:** Must document bilateral pathology and bilateral fixation clearly. Each side should have its own description in the op note.`,
    distractors: [
      { code: '27784', desc: 'ORIF lateral malleolus fracture', why: 'Also acceptable — 27792 and 27784 overlap for lateral malleolus/distal fibula. Consistency matters.' },
    ],
  },
  {
    id: 'sc9',
    difficulty: 'fellowship',
    title: 'Pilon Fracture — Staged Protocol',
    scenario: 'Stage 1 (Day 0): A 42-year-old male with a comminuted pilon fracture (AO 43-C3) from a fall. Spanning external fixator placed in the ED, with fibula ORIF through a lateral incision. PA-C assists. 60 minutes.\n\nStage 2 (Day 14): Definitive ORIF of the distal tibia through an anterior approach. External fixator removed. Bone graft from proximal tibia metaphysis. PA-C assists. 3 hours.',
    correctCodes: [
      { code: '27758', desc: 'ORIF tibial shaft fracture with plate/screws (Stage 1 — fibula)', primary: false },
      { code: '20690', desc: 'Application of uniplanar external fixation system (Stage 1)', primary: false },
      { code: '27827', desc: 'ORIF distal tibia fracture (Stage 2 — definitive)', primary: true },
      { code: '20694', desc: 'Removal of external fixation (Stage 2)', primary: false },
      { code: '20900', desc: 'Bone graft, small (Stage 2)', primary: false },
    ],
    correctModifiers: ['58', 'AS'],
    correctDiagnoses: [
      'S82.201A — Unspecified fracture of upper end of right tibia',
      'S82.101A — Unspecified fracture of upper end of right tibia',
    ],
    explanation: `**Staged pilon protocol — this is advanced.**

**Stage 1 bills:**
- 20690 (external fixator application)
- 27758 or 27792 (fibula ORIF — done at Stage 1 to restore length)
- -AS for PA-C on both

**Stage 2 bills:**
- 27827 (definitive tibial ORIF) with **-58 modifier** (staged/planned procedure during global period)
- 20694 (external fixator removal) — separately billable
- 20900 (bone graft, small) — separately billable if autograft harvested from a separate site
- -AS for PA-C on all

**Why -58?** Stage 2 is a PLANNED procedure during the 90-day global period of Stage 1. -58 tells the payer this was anticipated, not a complication.

**Key distinction from -78:** -78 = unplanned return (complication). -58 = planned staged procedure. Pilon staging is the textbook -58 case.

**Revenue:** Without -58, Stage 2 gets denied as part of Stage 1's global period. That's potentially $3,000+ in professional fees lost.`,
    distractors: [],
  },
  {
    id: 'sc10',
    difficulty: 'fellowship',
    title: 'Nonunion Revision with Hardware Removal',
    scenario: 'A 58-year-old female with a tibial shaft nonunion 9 months after initial IMN fixation (by another surgeon). You remove the existing nail, ream the canal, place a larger exchange nail, and augment with autologous bone graft from the iliac crest. PA-C assists. 2.5 hours.',
    correctCodes: [
      { code: '27759', desc: 'ORIF tibial shaft fracture with intramedullary implant', primary: true },
      { code: '20680', desc: 'Removal of implant, deep', primary: false },
      { code: '20902', desc: 'Bone graft, major — iliac crest', primary: false },
    ],
    correctModifiers: ['59', 'AS'],
    correctDiagnoses: [
      'M84.361A — Nonunion of fracture of right tibia',
      'T84.190A — Mechanical complication of internal fixation device of right tibia',
    ],
    explanation: `**Three distinct procedures, three codes:**

**27759** — the exchange nailing. You're placing a new intramedullary implant for the tibial shaft.

**20680** — hardware removal of the original nail. This is significant work (removing a nail, reaming) and is separately billable with -59.

**20902** — iliac crest bone graft. Harvesting autograft from a SEPARATE surgical site (the iliac crest) is always separately billable. If you used local bone from the tibial canal, it would NOT be separately billable.

**Key:** The bone graft site matters. Local bone graft (from the fracture site) = bundled. Separate harvest site (iliac crest, proximal tibia) = separate code.

**-59** on 20680 and 20902 to confirm distinct services.

**No -78 or -79** — this is well beyond the 90-day global period (9 months post-op) and was done by a different surgeon.`,
    distractors: [
      { code: '20900', desc: 'Bone graft, small', why: 'Iliac crest graft is a major harvest site — use 20902, not 20900' },
    ],
  },
]

// Flash card quiz questions
export const FLASH_CARDS = [
  // CPT identification
  { q: 'What CPT code: ORIF distal radius with volar plate?', a: '25607', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: ORIF intertrochanteric fracture with CMN?', a: '27245', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: ORIF isolated lateral malleolus?', a: '27792 (or 27784)', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: ORIF femoral shaft with IM nail?', a: '27507', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: Percutaneous fixation of femoral neck?', a: '27235 (cannulated screws)', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: ORIF acetabular fracture?', a: '27254', category: 'cpt', difficulty: 'senior' },
  { q: 'What CPT code: ORIF tibial plateau fracture?', a: '27524', category: 'cpt', difficulty: 'senior' },
  { q: 'What CPT code: Application of external fixator?', a: '20690 (uniplanar)', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: Hardware removal, deep?', a: '20680', category: 'cpt', difficulty: 'intern' },
  { q: 'What CPT code: Bone graft from iliac crest?', a: '20902', category: 'cpt', difficulty: 'senior' },

  // Modifier questions
  { q: 'When do you use the -AS modifier?', a: 'When a PA-C or NP assists at surgery (13.6% of Medicare rate)', category: 'modifier', difficulty: 'intern' },
  { q: 'What is modifier -59 used for?', a: 'Distinct procedural service — bypasses NCCI bundling edits when procedures are truly separate', category: 'modifier', difficulty: 'intern' },
  { q: 'When do you use -78 vs -79?', a: '-78 = unplanned return to OR for RELATED complication. -79 = unrelated procedure during postop period.', category: 'modifier', difficulty: 'senior' },
  { q: 'When do you use -22 modifier?', a: 'When the work required is SUBSTANTIALLY greater than typical. Must document why (obesity, unusual anatomy, excessive time).', category: 'modifier', difficulty: 'senior' },
  { q: 'What is modifier -57?', a: 'Decision for surgery — used on the E/M code when the evaluation results in the decision to operate', category: 'modifier', difficulty: 'intern' },
  { q: 'When do you use -58?', a: 'Staged or planned procedure during the postop global period (e.g., Stage 2 pilon fixation)', category: 'modifier', difficulty: 'fellowship' },
  { q: 'What is modifier -50 and what does it pay?', a: 'Bilateral procedure — same procedure both sides. Pays 150% of unilateral rate.', category: 'modifier', difficulty: 'senior' },
  { q: 'What is modifier -25?', a: 'Significant, separately identifiable E/M service on the same day as a procedure', category: 'modifier', difficulty: 'senior' },

  // Billing concepts
  { q: 'Ankle ORIF: medial + lateral through separate incisions. One code or two?', a: 'TWO codes: 27766 (medial) + 27792 (lateral) with -59. Separate incisions = separate procedures.', category: 'concept', difficulty: 'senior' },
  { q: 'Can you bill hardware removal (20680) in addition to revision ORIF?', a: 'Yes — if it required significant additional work. Bill with -59 modifier.', category: 'concept', difficulty: 'senior' },
  { q: 'Patient returns to OR 3 weeks after hip ORIF for wound washout. What modifier?', a: '-78 (unplanned return to OR for related complication during global period)', category: 'concept', difficulty: 'senior' },
  { q: 'Patient has hip ORIF, then falls and breaks wrist 6 weeks later. What modifier on the wrist code?', a: '-79 (unrelated procedure during postop period)', category: 'concept', difficulty: 'senior' },
  { q: 'What is the 90-day global period?', a: 'All related E/M visits for 90 days after a major surgery are included in the surgical fee. No separate billing for routine follow-up.', category: 'concept', difficulty: 'intern' },
  { q: 'ED consult → decision to operate → surgery same day. How do you bill the E/M?', a: 'Bill the E/M code with -57 modifier (decision for surgery)', category: 'concept', difficulty: 'intern' },
  { q: 'What is the difference between local and distant bone graft billing?', a: 'Local graft (from fracture site) = bundled in surgical code. Distant graft (iliac crest, separate site) = separately billable (20902).', category: 'concept', difficulty: 'fellowship' },
  { q: 'How much does -AS modifier pay relative to Medicare rate?', a: '13.6% of the Medicare fee schedule amount', category: 'concept', difficulty: 'intern' },
]

// RVU reference data for common ortho trauma codes
export const RVU_DATA = {
  '27236': { work: 12.13, total: 19.89, medicare: '$643' },
  '27244': { work: 14.52, total: 23.61, medicare: '$764' },
  '27245': { work: 14.68, total: 23.90, medicare: '$773' },
  '27254': { work: 25.58, total: 40.93, medicare: '$1,324' },
  '27507': { work: 16.07, total: 26.61, medicare: '$861' },
  '27524': { work: 17.84, total: 29.00, medicare: '$938' },
  '27758': { work: 15.56, total: 25.40, medicare: '$821' },
  '27759': { work: 16.07, total: 26.61, medicare: '$861' },
  '27766': { work: 8.70, total: 14.40, medicare: '$466' },
  '27784': { work: 8.70, total: 14.40, medicare: '$466' },
  '27792': { work: 10.64, total: 17.30, medicare: '$560' },
  '27814': { work: 12.42, total: 20.24, medicare: '$655' },
  '27822': { work: 14.72, total: 23.97, medicare: '$775' },
  '27823': { work: 16.57, total: 26.85, medicare: '$869' },
  '27827': { work: 17.73, total: 29.11, medicare: '$942' },
  '25607': { work: 10.64, total: 17.24, medicare: '$558' },
  '23615': { work: 14.56, total: 23.27, medicare: '$753' },
  '20680': { work: 5.45, total: 9.36, medicare: '$303' },
  '20690': { work: 6.03, total: 10.43, medicare: '$337' },
  '20694': { work: 3.11, total: 5.65, medicare: '$183' },
  '20900': { work: 2.56, total: 4.79, medicare: '$155' },
  '20902': { work: 5.06, total: 8.95, medicare: '$290' },
  '27235': { work: 8.64, total: 13.80, medicare: '$447' },
  '27279': { work: 7.95, total: 14.36, medicare: '$464' },
}
