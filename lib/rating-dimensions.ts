// Editorial content for the 10 rating-dimension entity pages (/ratings/[slug]).
// Stats shown on these pages are computed live from approved reviews.

export interface RatingDimension {
  key: string;          // column name in reviews table
  slug: string;         // URL slug
  label: string;        // display name (matches rating-config label)
  seoTitle: string;
  description: string;  // meta description
  definition: string;   // what it measures — answer-first paragraph
  whyItMatters: string[];
  howToCheck: string[]; // things to do before buying
  lowScoreMeans: string;
  highScoreMeans: string;
  relatedGuideSlugs: string[];
  faq: { q: string; a: string }[];
}

export const RATING_DIMENSIONS: RatingDimension[] = [
  {
    key: "understandability",
    slug: "concept-clarity",
    label: "Concept Clarity",
    seoTitle: "Concept Clarity in CA Coaching: What It Means & How to Check It",
    description:
      "Concept Clarity measures whether a CA faculty's explanations actually land — or whether students end up re-learning from YouTube after class. How students rate it on Careviews, and how to check it before buying.",
    definition:
      "Concept Clarity measures whether a faculty's explanations are understood the first time — or whether students walk out of class needing to re-learn the topic from YouTube, the module, or a friend. It is the single most-cited reason students recommend or regret a faculty.",
    whyItMatters: [
      "Every hour spent re-learning a badly explained topic is an hour your schedule didn't budget for. Across a 300-hour course, weak clarity silently doubles your effort.",
      "Clarity problems compound: a concept you half-understood in chapter 3 becomes a wall in chapter 9.",
      "Demo lectures always feel clear — faculties pick their best chapter. Real clarity shows up in the hard, boring middle of the syllabus.",
    ],
    howToCheck: [
      "Read reviews from students in your course type — clarity in a face-to-face batch doesn't always survive the recorded version.",
      "Look for the phrase pattern \"had to watch twice\" or \"understood only after revision\" in reviews — that's a clarity complaint in disguise.",
      "Ask a senior who studied the full course, not someone who watched the demo.",
    ],
    lowScoreMeans: "Students frequently needed second sources — YouTube, the ICAI module, other faculties — to understand topics after class.",
    highScoreMeans: "Students consistently report understanding topics in the first pass, including the hard chapters.",
    relatedGuideSlugs: ["teaching-style", "dont-buy-the-demo"],
    faq: [
      {
        q: "What is Concept Clarity in CA coaching reviews?",
        a: "It measures whether a faculty's explanations are understood the first time, or whether students needed to re-learn topics from other sources after class. On Careviews it is rated 1-5 by students who completed the course.",
      },
      {
        q: "How do I check a CA faculty's concept clarity before buying?",
        a: "Don't rely on the demo — faculties demo their best chapter. Read reviews from students in your exact course type, and look for repeated mentions of needing to rewatch lectures or use second sources.",
      },
    ],
  },
  {
    key: "exam_focus",
    slug: "exam-focus",
    label: "Exam Focus & Efficiency",
    seoTitle: "Exam Focus in CA Coaching: Why It Matters & How to Check It",
    description:
      "Exam Focus measures whether teaching stays ICAI-exam-relevant or wanders into untested territory. How students rate it on Careviews, and how to evaluate it before you pay.",
    definition:
      "Exam Focus measures whether teaching time is spent on what ICAI actually tests — or on tangents, war stories, and academic depth that never appears in the paper. High exam focus means the course's hours convert efficiently into marks.",
    whyItMatters: [
      "CA syllabi are enormous. A faculty who spends three lectures on a 2-mark topic is spending your attempt, not theirs.",
      "Some brilliant teachers are poor exam guides — depth is satisfying in class and expensive in the exam hall.",
      "Exam focus determines whether the course's hour count is real: 200 focused hours beat 350 wandering ones.",
    ],
    howToCheck: [
      "Ask whether presentation, answer-writing format, and ICAI keywords are taught alongside concepts.",
      "Check reviews for mentions of RTPs, MTPs, and past papers being integrated into teaching rather than left \"for self-study\".",
      "Compare the course's hour count to competitors for the same paper — a large gap in either direction deserves an explanation.",
    ],
    lowScoreMeans: "Students report time spent on untested depth or tangents, and having to build exam technique separately.",
    highScoreMeans: "Students report teaching that maps directly to how ICAI examines the subject.",
    relatedGuideSlugs: ["icai-module-vs-beyond", "lecture-length"],
    faq: [
      {
        q: "What does Exam Focus mean in CA faculty reviews?",
        a: "It measures whether teaching stays relevant to what ICAI actually tests — including answer-writing technique and coverage of RTPs, MTPs and past papers — rather than wandering into depth the exam never rewards.",
      },
      {
        q: "Is a longer CA course better?",
        a: "Not necessarily. Hours only matter if they're exam-relevant. A 200-hour exam-focused course typically converts to marks better than a 350-hour course padded with untested depth.",
      },
    ],
  },
  {
    key: "study_material_quality",
    slug: "study-material",
    label: "Study Material & Notes",
    seoTitle: "CA Study Material Quality: What Students Rate & How to Check It",
    description:
      "Study Material & Notes measures whether a CA course's books are good enough to revise from. How students rate material quality on Careviews and what to verify before buying.",
    definition:
      "Study Material & Notes measures whether the books and notes that come with the course are good enough to revise from — because by exam time, the lectures are a memory and the material is all you have.",
    whyItMatters: [
      "You watch lectures once; you revise from material three or four times. The material outlives the teaching.",
      "Bad material creates invisible work: students rewrite notes, summarise chapters, or buy third-party books — all unbudgeted hours.",
      "Material quality varies wildly between faculties teaching the same paper, and it's rarely visible in the demo.",
    ],
    howToCheck: [
      "Ask for sample pages from a hard chapter, not the marketing sample.",
      "Check reviews for the pattern \"made my own notes\" — if most students rebuilt the material, the material failed.",
      "Verify the material is amended for your attempt, not a reprint of last year's.",
    ],
    lowScoreMeans: "Students frequently rewrote or replaced the provided material to be able to revise.",
    highScoreMeans: "Students revised directly from the provided books and notes through multiple passes.",
    relatedGuideSlugs: ["study-material-and-books", "printed-notes-vs-own-notes"],
    faq: [
      {
        q: "How important is study material in a CA course?",
        a: "More important than most buyers assume. Lectures are watched once; material is revised from repeatedly. If the notes can't support revision, students end up rebuilding them — a large hidden time cost.",
      },
      {
        q: "How do I check CA study material quality before buying?",
        a: "Ask for sample pages from a difficult chapter, verify the material is amended for your attempt, and read reviews for repeated mentions of students making their own notes — that pattern means the material didn't hold up.",
      },
    ],
  },
  {
    key: "mock_coverage",
    slug: "icai-questions-coverage",
    label: "ICAI Questions Coverage",
    seoTitle: "ICAI Question Coverage in CA Coaching: MTPs, RTPs & PYQs Explained",
    description:
      "ICAI Questions Coverage measures whether MTPs, RTPs and past papers are actually solved in class. How students rate it on Careviews and how to verify it before buying.",
    definition:
      "ICAI Questions Coverage measures whether the faculty actually works through ICAI's own question bank — MTPs, RTPs, and past year papers — in class, rather than leaving them as an exercise for the student.",
    whyItMatters: [
      "ICAI recycles patterns. Students who've worked the question bank recognise the paper; students who haven't meet it for the first time in the hall.",
      "\"Covered in class\" and \"provided as PDF\" are very different promises that sound identical in marketing.",
      "Question practice is where concepts turn into marks — a course can be conceptually excellent and still leave you exam-unready.",
    ],
    howToCheck: [
      "Ask specifically: are MTPs/RTPs solved on screen in class, or distributed as homework?",
      "Check whether coverage extends to your attempt's most recent RTP or stops a few cycles back.",
      "Look for reviews mentioning question practice — its absence in reviews usually means its absence in class.",
    ],
    lowScoreMeans: "Students report ICAI questions being skipped, rushed, or left entirely to self-study.",
    highScoreMeans: "Students report MTPs, RTPs and PYQs being solved and explained as part of teaching.",
    relatedGuideSlugs: ["mock-tests", "icai-module-vs-beyond"],
    faq: [
      {
        q: "What are MTPs and RTPs in CA preparation?",
        a: "Mock Test Papers and Revision Test Papers published by ICAI itself. They're the closest public signal of how ICAI examines a subject, which is why coverage of them in class matters when choosing coaching.",
      },
      {
        q: "Should ICAI questions be solved in class or given as homework?",
        a: "In class, at least substantially. \"Provided as PDF\" is not coverage — the value is in watching the solving approach, not possessing the questions.",
      },
    ],
  },
  {
    key: "coverage_of_questions",
    slug: "syllabus-coverage",
    label: "Syllabus Coverage",
    seoTitle: "CA Syllabus Coverage: How to Check Nothing Gets Quietly Skipped",
    description:
      "Syllabus Coverage measures whether the full ICAI syllabus was actually taught, or whether chapters were quietly dropped. How students rate it on Careviews.",
    definition:
      "Syllabus Coverage measures whether the course teaches the full ICAI syllabus — or quietly skips, compresses, or \"leaves for self-study\" the chapters that were inconvenient to record.",
    whyItMatters: [
      "A skipped chapter isn't a discount, it's a transfer: the work moves from the faculty to you, at full price.",
      "Skipping clusters in the same places — late chapters, amendment-heavy topics, low-weightage-but-testable areas. ICAI knows this too.",
      "Fast Track batches legitimately compress; the question is whether the compression is disclosed or discovered.",
    ],
    howToCheck: [
      "Get the chapter-by-chapter lecture index before buying and diff it against the ICAI syllabus.",
      "Ask which topics are marked self-study, and how many marks they carried in recent attempts.",
      "Read reviews from students who finished the whole course — coverage complaints appear at the end, not the start.",
    ],
    lowScoreMeans: "Students discovered skipped or severely compressed chapters after buying.",
    highScoreMeans: "Students confirm the full syllabus was taught to a usable depth.",
    relatedGuideSlugs: ["lecture-length", "regular-vs-fast-track"],
    faq: [
      {
        q: "Do CA coaching courses skip chapters?",
        a: "Some do — usually late chapters, amendment-heavy topics, or low-weightage areas, often labelled 'self-study'. Ask for the lecture index before buying and compare it against the ICAI syllabus.",
      },
      {
        q: "Is it okay if a Fast Track batch skips topics?",
        a: "Compression is the point of Fast Track — but it should be disclosed upfront. The problem isn't fewer hours, it's discovering the gaps during revision.",
      },
    ],
  },
  {
    key: "doubt_resolution",
    slug: "doubt-resolution",
    label: "Doubt Resolution",
    seoTitle: "Doubt Resolution in CA Classes: How to Verify Support Is Real",
    description:
      "Doubt Resolution measures whether student doubts actually get answered — and how fast. How students rate doubt support on Careviews and how to test it before buying.",
    definition:
      "Doubt Resolution measures whether your questions actually get answered — properly and in useful time — once you've paid. Every course promises doubt support; this rating measures whether the promise survives contact with a real backlog.",
    whyItMatters: [
      "One unresolved doubt in a foundational topic can stall a whole chapter — the cost isn't the question, it's the queue behind it.",
      "Support quality collapses exactly when you need it most: the pre-exam months, when every student is asking at once.",
      "\"Telegram group exists\" and \"doubts get answered\" are different facts. Marketing states the first, reviews reveal the second.",
    ],
    howToCheck: [
      "Send a real doubt to the support channel before buying and time the response.",
      "Read reviews for response-time mentions — \"replied in days\" or \"got 'noted' and nothing\" are the honest data.",
      "Ask whether doubts are answered by the faculty, a team, or other students — all can work, but you should know which you're buying.",
    ],
    lowScoreMeans: "Students report doubts acknowledged but not resolved, or response times measured in days.",
    highScoreMeans: "Students report doubts genuinely resolved in time to keep studying.",
    relatedGuideSlugs: ["doubt-support"],
    faq: [
      {
        q: "How do I test a CA course's doubt support before buying?",
        a: "Send a genuine doubt through their advertised channel before you pay, and time the answer. A support system that's slow for a prospective buyer will not get faster for a paid one.",
      },
      {
        q: "Does it matter who answers doubts — the faculty or a team?",
        a: "Both can work. What matters is response time and answer quality at scale, especially in pre-exam months. Reviews from students in exam season are the best evidence.",
      },
    ],
  },
  {
    key: "revision_support",
    slug: "revision-quality",
    label: "Revision Quality",
    seoTitle: "Revision Classes in CA Coaching: What Good Revision Support Looks Like",
    description:
      "Revision Quality measures whether a course's revision classes actually consolidate the syllabus, or just replay it slower. How students rate revision support on Careviews.",
    definition:
      "Revision Quality measures whether the course helps you consolidate near the exam — compact revision lectures, summary material, charts — or abandons you with 300 hours of content and no way back through it.",
    whyItMatters: [
      "The last 6 weeks decide the attempt. A course's value at that point is its revision layer, not its main lectures.",
      "Re-watching full lectures is not revision — there isn't time. Good courses compress; weak ones just replay.",
      "Revision material quality is invisible at purchase time and decisive at exam time — exactly the kind of thing reviews exist for.",
    ],
    howToCheck: [
      "Ask what specifically exists for revision: separate revision batch? summary notes? charts? Or nothing?",
      "Check whether revision content is included in the price or sold separately later.",
      "Read reviews from students who sat the exam — only they experienced the revision layer.",
    ],
    lowScoreMeans: "Students found themselves rebuilding revision material or re-watching full lectures under time pressure.",
    highScoreMeans: "Students report compact, usable revision support that made the final weeks manageable.",
    relatedGuideSlugs: ["study-material-and-books", "course-validity"],
    faq: [
      {
        q: "What should a CA course include for revision?",
        a: "Some combination of compact revision lectures, summary notes and charts. The test: can you get back through the full syllabus in the final weeks without re-watching main lectures? If not, the revision layer is missing.",
      },
      {
        q: "Are revision batches worth paying extra for?",
        a: "Often, yes — but check whether revision content should have been included. Reviews reveal whether a faculty's 'revision batch' adds compression or just re-sells the main content slower.",
      },
    ],
  },
  {
    key: "pace_of_teaching",
    slug: "pace-of-teaching",
    label: "Pace of Teaching",
    seoTitle: "Pace of Teaching in CA Classes: Too Fast, Too Slow, or Right for You",
    description:
      "Pace of Teaching measures whether students could actually keep up with the speed of instruction. How students rate teaching pace on Careviews, and how to judge it beyond the demo.",
    definition:
      "Pace of Teaching measures whether students could follow the speed of instruction across the whole course — not the demo chapter, but the dense middle where pace problems actually surface.",
    whyItMatters: [
      "Pace mismatch is bidirectional: too fast creates backlog and panic; too slow burns hours you don't have and invites 2x-watching that becomes skimming.",
      "A pace that suits a repeat student steamrolls a first-attempt student. The same course is genuinely different courses for different buyers.",
      "Demos mislead on pace more than anything else — faculties slow down for demos the way drivers slow down for cameras.",
    ],
    howToCheck: [
      "Filter reviews by students with your background — first attempt vs re-attempt changes what \"fast\" means.",
      "Ask how the pace behaves in numerical/practical chapters specifically; theory pace tells you little.",
      "Check the hours-to-syllabus ratio against competing courses — extreme ratios are pace warnings in either direction.",
    ],
    lowScoreMeans: "Students report losing the thread mid-course — backlog, rewatching, or boredom-driven skimming.",
    highScoreMeans: "Students report a pace they could sustain through the full syllabus.",
    relatedGuideSlugs: ["teaching-speed", "regular-vs-fast-track"],
    faq: [
      {
        q: "How do I know if a CA faculty teaches too fast for me?",
        a: "Read reviews from students with your profile — first-attempt students experience pace very differently from re-attempters. Demo lectures are unreliable; faculties consciously slow down in demos.",
      },
      {
        q: "Is watching CA lectures at 2x speed a good idea?",
        a: "If a course is only tolerable at 2x, that's a pace-mismatch signal at purchase time. Speed-watching works for revision, not for first-pass learning of dense chapters.",
      },
    ],
  },
  {
    key: "value_for_money",
    slug: "value-for-money",
    label: "Value for Money",
    seoTitle: "Value for Money in CA Coaching: How Students Actually Judge It",
    description:
      "Value for Money measures whether a CA course was worth its fee compared to alternatives. How students rate value on Careviews, and how to evaluate price properly before buying.",
    definition:
      "Value for Money measures whether students felt the course justified its fee — factoring in everything the sticker price hides: material quality, doubt support, revision layers, validity terms, and what competitors charge for the same paper.",
    whyItMatters: [
      "The real cost of a bad course isn't its fee — it's the attempt it costs you. A ₹4,000 saving that causes a six-month delay is the most expensive discount in education.",
      "Price varies several-fold between faculties teaching the identical syllabus; the difference is sometimes quality and sometimes brand tax. Reviews are how you tell which.",
      "Cheap courses that need supplementing — extra books, test series, revision batches — often total more than the expensive course that included everything.",
    ],
    howToCheck: [
      "Total the real cost: course + books you'll still need + test series + validity extension you might buy. Compare that number, not sticker prices.",
      "Read negative reviews of expensive courses and positive reviews of cheap ones — the overlap is where the honest price signal lives.",
      "Ask what's not included; the answer is the actual price list.",
    ],
    lowScoreMeans: "Students felt the fee bought less than promised, or that cheaper alternatives delivered the same.",
    highScoreMeans: "Students would pay the fee again knowing everything they know now.",
    relatedGuideSlugs: ["course-validity", "choose-your-goal"],
    faq: [
      {
        q: "Why do CA course prices vary so much for the same subject?",
        a: "A mix of production quality, included material, support infrastructure, brand premium, and batch format. Some of the premium is real value, some is brand tax — student reviews comparing outcomes are the way to separate them.",
      },
      {
        q: "Is expensive CA coaching worth it?",
        a: "Sometimes. Compare total real cost (course + supplements + extensions) against review patterns, not sticker prices. The most expensive outcome is the extra attempt a bad-fit course causes, whatever its fee.",
      },
    ],
  },
  {
    key: "expectation_match",
    slug: "expectation-match",
    label: "Expectation Match",
    seoTitle: "Expectation Match: Did the CA Course Deliver What the Demo Promised?",
    description:
      "Expectation Match measures the gap between what a CA course's marketing promised and what students actually received. How it's rated on Careviews and how to protect yourself from demo bias.",
    definition:
      "Expectation Match measures the gap between what the demo and marketing promised and what the paid course actually delivered. It is the purest honesty metric on Careviews — a direct rating of the sales pitch against the product.",
    whyItMatters: [
      "Every faculty's demo is their best 90 minutes. Expectation Match tells you what the other 300 hours are like.",
      "Common gaps: demo chapter energy vs mid-course energy, promised support vs actual response times, \"fully amended\" claims vs reality.",
      "A low Expectation Match on a high-rated faculty is a specific warning: the product is good but the marketing oversells it — calibrate accordingly.",
    ],
    howToCheck: [
      "Treat this rating as your demo-discount factor: the lower it is, the less the demo should influence you.",
      "Read the review text behind low scores — students usually name the exact promise that broke.",
      "Compare the faculty's marketing claims against review mentions point by point: amendments, support, coverage, validity.",
    ],
    lowScoreMeans: "Students report a meaningful gap between what was promised and what was delivered.",
    highScoreMeans: "Students report the course matched or beat what the demo and marketing led them to expect.",
    relatedGuideSlugs: ["dont-buy-the-demo", "read-patterns-not-opinions"],
    faq: [
      {
        q: "What is Expectation Match in CA faculty reviews?",
        a: "A 1-5 student rating of the gap between what the course's demo and marketing promised and what was actually delivered — effectively a rating of the sales pitch against the product.",
      },
      {
        q: "Why do CA demo lectures feel better than the actual course?",
        a: "Demos are curated: best chapter, highest energy, slowest pace. Expectation Match exists precisely to measure how far the real course sits from that impression.",
      },
    ],
  },
];

export function getDimension(slug: string): RatingDimension | undefined {
  return RATING_DIMENSIONS.find((d) => d.slug === slug);
}

export function getDimensionByKey(key: string): RatingDimension | undefined {
  return RATING_DIMENSIONS.find((d) => d.key === key);
}
