# Know Your Product Launch Plan

43 tasks from the problem statement, mapped to the eight topic files. Each task lists what it depends on, so you can see which can start now. Owners and dates are not set yet.

- **Resolve issues**5
- **Reference files**29
- **Build**4
- **Test**3
- **Launch**2

## Phase 0 Resolve issues 5 tasks

### 0 - Prepare the brief

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T0.1 | Fix sub-scores for personal care  Processing level and nutrition balance are food measures; define personal care sub-scores or a not-applicable rule | `01-scoring-methodology.md` | Decision recorded in 01-scoring-methodology.md | – | Not started |
| T0.2 | Add price and quantity input  Quality ROI needs price and quantity; the inputs list does not ask for price | `06-label-reading-guide.md` | Price and quantity added to inputs | – | Not started |
| T0.3 | Place input scenarios and product universe  Photo / weblink or barcode / hybrid inputs and the Whole Foods and Sri Sri Tattva limit have no topic file | `06-label-reading-guide.md or new 09 file` | Decision on 06 vs new 09 file | – | Not started |
| T0.4 | Remove pasted chat text  Delete the assistant replies at the end of the document | `Problem Statement.docx` | Clean problem statement | – | Not started |
| T0.5 | Create the process flow diagram  The Process Flow folder is empty; draw the flow to check the plan against | `Process Flow folder` | Process flow diagram | – | Not started |

## Phase 1 Reference files 29 tasks

### 1 - Set the source rules

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T1.1 | List allowed bodies  FDA, USDA (incl. National Organic Program), EPA, CDC, NIH, EFSA, WHO/IARC, Codex Alimentarius, FSSAI | `02-approved-sources.md` | Allowed bodies list with URLs | T0.4 | Not started |
| T1.2 | List official registries  FDA import alerts, FDA recalls, GRAS notices, Food Additive Status List, USDA Organic Integrity Database, import/export registries | `02-approved-sources.md` | Registry list with URLs | T1.1 | Not started |
| T1.3 | Set journalism rule  NYT and similar used as context only, never as the basis for a risk rating | `02-approved-sources.md` | Journalism rule | T1.1 | Not started |
| T1.4 | Rank sources for conflicts  Define which source wins when sources disagree | `02-approved-sources.md` | Source ranking | T1.1, T1.2 | Not started |
| T1.5 | Add citation rules  Cite every risk claim; say "No authoritative data found" when no source covers it | `02-approved-sources.md` | Citation rules | T1.4 | Not started |
| T1.6 | Settle extensive-list question  Resolve the note "double check if extensive list needs to be used" | `02-approved-sources.md` | Decision recorded | T1.2 | Not started |

### 2 - Build the claims glossary

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T2.1 | Define core label terms  Organic, natural, non-GMO, clean label and similar: legal definition, certifying body, red flags | `03-key-terms-registry.md` | Glossary entries | T1.5 | Not started |
| T2.2 | Cover questioned packaging claims  "Organic", "No GMO", "no micronutrients"; environment and body impact claims | `03-key-terms-registry.md` | Glossary entries | T2.1 | Not started |
| T2.3 | Add new-term process  Template and rule for adding terms as they are met | `03-key-terms-registry.md` | Add-a-term template | T2.1 | Not started |

### 3 - List the risky ingredients

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T3.1 | List flagged additives  Each additive with regulatory status and limits, cited | `04-additives-and-ingredients-of-concern.md` | Additives list | T1.5 | Not started |
| T3.2 | Add plastic-related side effects  Phthalates, BPA and other plastic-related ingredients and their side effects | `04-additives-and-ingredients-of-concern.md` | Ingredients of concern list | T3.1 | Not started |

### 4 - Define the score

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T4.1 | Define Wellbeing Index (0-100)  Sub-scores: ingredient safety, processing level, additives, nutrition balance, claim integrity; set weights | `01-scoring-methodology.md` | Index definition and weights | T0.1, T3.2, T2.2 | Not started |
| T4.2 | Set risk tiers and scoring rules  Low / Moderate / High tiers and how each sub-score is calculated | `01-scoring-methodology.md` | Risk tiers and rules | T4.1 | Not started |
| T4.3 | Anchor to wellbeing definition  Wellbeing = product does its job (efficacy) without side effects | `01-scoring-methodology.md` | Scoring principle | T4.1 | Not started |
| T4.4 | Add Quality ROI  Quality ROI = Wellbeing Index / price / quantity x 100 | `01-scoring-methodology.md` | ROI formula | T4.1, T0.2 | Not started |

### 5 - Plan the lookups

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T5.1 | Write registry reading guide  How to read FDA import alerts, recalls, GRAS notices and the organic certification database | `05-regulatory-registries.md` | Registry how-to | T1.2 | Not started |
| T5.2 | Define check record  What to record from each registry check | `05-regulatory-registries.md` | Check record format | T5.1 | Not started |

### 6 - Get product data in

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T6.1 | Define photo inputs  Front and back photos of both products plus ingredient lists | `06-label-reading-guide.md` | Photo input spec | T0.3 | Not started |
| T6.2 | Define fields to read  Brand, claims, ingredients in order, additives, nutrition panel, serving sizes | `06-label-reading-guide.md` | Field list | T6.1 | Not started |
| T6.3 | Support input options  Post two photos; type details (weblink or barcode); hybrid | `06-label-reading-guide.md` | Input options spec | T6.1, T0.3 | Not started |
| T6.4 | Add unreadable-label rule  If a label cannot be read, say so instead of guessing | `06-label-reading-guide.md` | No-guessing rule | T6.2 | Not started |

### 7 - Fix the report layout

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T7.1 | Product snapshot section  Name, claims made, full ingredient list | `07-output-template.md` | Template section 1 | T6.2 | Not started |
| T7.2 | Ingredient risk check section  Low / Moderate / High per ingredient with the authority named | `07-output-template.md` | Template section 2 | T3.2, T4.2 | Not started |
| T7.3 | Claim verification section  Check claims against key-terms registry; flag unverifiable or misleading claims | `07-output-template.md` | Template section 3 | T2.2 | Not started |
| T7.4 | Wellbeing Index section  Score with sub-scores plus Quality ROI | `07-output-template.md` | Template section 4 | T4.4 | Not started |
| T7.5 | Verdict section  Better choice, trade-offs, who should be careful (children, pregnancy, allergies) | `07-output-template.md` | Template section 5 | T7.4 | Not started |
| T7.6 | Apply tone rules  Plain language a couple can act on in store; inform without alarming; no medical advice | `07-output-template.md` | Tone rules in template | T7.5 | Not started |

### 8 - Set the standard

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T8.1 | Worked example: Head & Shoulders vs protein shampoo  Full report using the template | `08-sample-comparisons.md` | Worked example 1 | T7.6 | Not started |
| T8.2 | Write 1-2 more worked examples  Personal care and supplements within Whole Foods and Sri Sri Tattva | `08-sample-comparisons.md` | Worked examples 2-3 | T8.1 | Not started |

## Phase 2 Build 4 tasks

### Build the app

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T9.1 | Build input capture  Photo upload, weblink/barcode entry and hybrid flow, plus price and quantity | `06-label-reading-guide.md` | Working input screens | T6.3, T6.4 | Not started |
| T9.2 | Build risk and claim checks  Match ingredients and claims against the reference files and registries, with citations | `05-regulatory-registries.md; 04-additives-and-ingredients-of-concern.md; 03-key-terms-registry.md` | Working checks | T9.1, T5.2, T3.2, T2.3 | Not started |
| T9.3 | Build scoring engine  Wellbeing Index, sub-scores and Quality ROI | `01-scoring-methodology.md` | Working scores | T9.2, T4.4 | Not started |
| T9.4 | Build comparison report  Five-section report following the template | `07-output-template.md` | Working report | T9.3, T7.6 | Not started |

## Phase 3 Test 3 tasks

### Test and review

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T10.1 | Test against worked examples  App output matches the worked examples | `08-sample-comparisons.md` | Test results | T9.4, T8.2 | Not started |
| T10.2 | Audit citations  Every risk claim cited from an allowed source; journalism never used for ratings | `02-approved-sources.md` | Citation audit | T10.1 | Not started |
| T10.3 | Review wording and tone  Plain, non-alarming, no medical advice | `07-output-template.md` | Tone review sign-off | T10.1 | Not started |

## Phase 4 Launch 2 tasks

### Launch

| ID | Task | Topic file | Deliverable | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| T11.1 | Prepare demo  Demo with Whole Foods and Sri Sri Tattva products | `08-sample-comparisons.md` | Demo script | T10.2, T10.3 | Not started |
| T11.2 | Launch the app  Go live | `All` | Live app | T11.1 | Not started |