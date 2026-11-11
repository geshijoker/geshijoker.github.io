/*
  All of the site's words, links and photos live in this file.
  Edit it, save, and reload the page. No build step.

  Bio paragraphs and timeline notes can include links written as [text](https://...).

  Research item fields
    type:    "paper" | "blog" | "media"   (media covers demos, talks, videos, interviews)
    title:   string
    year:    number (leave out while status is "in-prep")
    date:    optional "YYYY-MM", makes the Latest filter exact (year-only counts as December)
    venue:   where it appeared, e.g. "KDD 2022", "arXiv preprint", "YouTube"
    authors: optional list of names; "Ge Shi" is shown in bold (a trailing * is kept)
    note:    optional short line after the venue, e.g. "* Equal contribution"
    status:  optional, "in-prep" shows it as upcoming
    links:   [{ label, url }], the first link is used for the title

  Life story fields
    type:    "travel" | "event" | "story"
    title, place, date: strings
    image:   path such as "assets/photos/kyoto.jpg" (leave "" for a placeholder)
    alt:     a short description of the photo for screen readers
    text:    a few sentences shown when someone opens the card
*/

window.SITE = {
  name: "Ge Shi",
  // Each item is one line under your name.
  tagline: ["Applied scientist at Amazon", "Agentic AI", "Ph.D. in Computer Science"],

  about: {
    heading: "Hi, I'm Ge.",
    bio: [
      "I'm an applied scientist at Amazon, where I build a centralized agentic system that automates Amazon's standard operating procedures (SOPs). I've built and evaluated agents end to end, from design through deployment in production. My current research centers on self-improving agents and continual learning: agents that keep getting better after they ship.",
      "I came to agents from explainability and responsible AI. My Ph.D. at UC Davis, advised by [Prof. Ian Davidson](https://faculty.engineering.ucdavis.edu/davidson/), was about understanding what models do and why, through attribution methods, benchmarks for evaluating them, and visual analytics for loss landscapes. I also worked with [Prof. Michael Mahoney](https://www.stat.berkeley.edu/~mmahoney/)'s Machine Learning and Analytics group on loss landscapes and their applications. For my M.S. at UMass Amherst, I worked on computer vision and video stabilization with [Prof. Erik Learned-Miller](https://people.cs.umass.edu/~elm/). For my B.S. at Zhejiang University, I worked on simultaneous localization and mapping (SLAM) with [Prof. Yu Zhang](https://person.zju.edu.cn/zhangyu/).",
      "I welcome inquiries about research opportunities, collaborations, speaking engagements, and referrals. Please reach out on [LinkedIn](https://www.linkedin.com/in/ge-shi-phd-77191b86/). To prepare for interviews, you can also [book a mock interview](https://mockwithme.simplybook.me/v2/) with me."
    ],
    interests: [
      "Agentic AI",
      "Recursive self-improvement (RSI)",
      "Reinforcement learning",
      "Multimodal large language models",
      "Explainable and responsible AI"
    ],
    // Newest first. Add a "years" field (e.g. "2025 to now") to any entry if you like.
    timeline: [
      {
        title: "Applied Scientist",
        org: "Amazon",
        note: "Centralized agentic system for SOP automation"
      },
      {
        title: "Ph.D., Computer Science",
        org: "University of California, Davis",
        note: "Responsible AI, advised by [Prof. Ian Davidson](https://faculty.engineering.ucdavis.edu/davidson/)"
      },
      {
        title: "M.S., Computer Science",
        org: "University of Massachusetts Amherst",
        note: "Computer vision, advised by [Prof. Erik Learned-Miller](https://people.cs.umass.edu/~elm/)"
      },
      {
        title: "B.S., Automation",
        org: "Zhejiang University",
        note: "Robotic SLAM research, advised by [Prof. Yu Zhang](https://person.zju.edu.cn/zhangyu/)"
      }
    ],
    links: [
      { label: "Email", url: "mailto:geshijoker@gmail.com" },
      { label: "Google Scholar", url: "https://scholar.google.com/citations?hl=en&user=44UCIuEAAAAJ" },
      { label: "GitHub", url: "https://github.com/geshijoker" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/ge-shi-phd-77191b86/" },
      { label: "Book a mock interview", url: "https://mockwithme.simplybook.me/v2/" },
      { label: "X / Twitter", url: "https://twitter.com/Ge1685955927" },
      { label: "Resume (PDF)", url: "assets/resume.pdf" }
    ]
  },

  research: {
    intro: "Filter to see categories of scientific contributions.",
    items: [
      {
        type: "paper", year: 2026, date: "2026-11", venue: "arXiv preprint",
        title: "WASP-Mem: Let Agent Organize Procedural Memory. Human Spend Effort on Diagnosis",
        authors: ["Peizhi Niu*", "Ge Shi*", "Vaibhav Gorde", "Sarthak Ghosh", "Christos Faloutsos", "Min Cheng", "Kevin Chen"],
        note: "* Equal contribution",
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2611.04003" }]
      },
      {
        type: "paper", year: 2026, date: "2026-11", venue: "NeurIPS 2026 Workshop on Agentic AI Benchmarks and Applications for Enterprise Tasks",
        title: "SLATE: A Large-Scale Benchmark for Long-Horizon API Selection in E-commerce Tool Use",
        authors: ["Rongzhe Wei*", "Ge Shi*", "Min Cheng", "Sarthak Ghosh", "Vaibhav Gorde", "Leman Akoglu", "Pan Li", "Na Zhang"],
        note: "* Equal contribution",
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2611.03982" }, { label: "Project page", url: "slate/" }]
      },
      {
        type: "paper", year: 2026, date: "2026-09", venue: "arXiv preprint",
        title: "What a Model Refuses, a State Fears: How Authoritarian Information Control Reproduces in Language-Model Guardrails",
        authors: ["Menglin Liu", "Yao Yu", "Tong Wu", "Ge Shi"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2609.07507" }]
      },
      {
        type: "paper", year: 2026, date: "2026-08", venue: "arXiv preprint",
        title: "Are LLMs Positionally Consistent Ordinal Classifiers? A Systematic Evaluation",
        authors: ["Yu Wang", "Zhe Zhou", "Menglin Liu", "Ge Shi"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2608.08869" }]
      },
      {
        type: "paper", year: 2026, date: "2026-06", venue: "arXiv preprint",
        title: "JailbreakOPT: Iterative Jailbreak Prompt Optimization with Macro-Action",
        authors: ["Ge Shi", "Jun Yin", "Donglin Xie", "Fangyi Liu", "Yucan Li", "Menglin Liu"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2606.11425" }]
      },
      {
        type: "paper", year: 2026, date: "2026-04", venue: "arXiv preprint",
        title: "Long-Horizon Plan Execution in Large Tool Spaces through Entropy-Guided Branching",
        authors: ["Rongzhe Wei", "Ge Shi", "Min Cheng", "Na Zhang", "Pan Li", "Sarthak Ghosh", "Vaibhav Gorde", "Leman Akoglu"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2604.12126" }]
      },
      {
        type: "paper", year: 2026, date: "2026-11", venue: "ICDM 2026",
        title: "ChaosMining: Benchmarking Post-Hoc Attribution with Sparse Informative Features in High Dimensions",
        authors: ["Ge Shi", "Fangyi Liu", "Ziwen Kan", "Menglin Liu"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2406.12150" }]
      },
      {
        type: "paper", year: 2025, venue: "IEEE Computer Graphics and Applications",
        title: "LossLens: Diagnostics for Machine Learning through Loss Landscape Visual Analytics",
        authors: ["Tiankai Xie", "Jiaqing Chen", "Yaoqing Yang", "Caleb Geniesse", "Ge Shi", "Ajinkya Chaudhari", "John Kevin Cava", "Michael W. Mahoney", "Talita Perciano", "Gunther H. Weber", "Ross Maciejewski"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2412.13321" }]
      },
      {
        type: "paper", year: 2024, date: "2024-12", venue: "NeurReps 2024 (PMLR)",
        title: "Visualizing Loss Functions as Topological Landscape Profiles",
        authors: ["Caleb Geniesse", "Jiaqing Chen", "Tiankai Xie", "Ge Shi", "Yaoqing Yang", "Dmitriy Morozov", "Talita Perciano", "Michael W. Mahoney", "Ross Maciejewski", "Gunther H. Weber"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2411.12136" }]
      },
      {
        type: "paper", year: 2024, date: "2024-09", venue: "arXiv preprint",
        title: "Enhancing LLM-Based Text Classification in Political Science: Automatic Prompt Optimization and Dynamic Exemplar Selection for Few-Shot Learning",
        authors: ["Menglin Liu", "Ge Shi"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2409.01466" }]
      },
      {
        type: "paper", year: 2024, date: "2024-08", venue: "SSRN preprint",
        title: "PoliPrompt: A High-Performance Cost-Effective LLM-Based Text Classification Framework for Political Science",
        authors: ["Menglin Liu", "Ge Shi"],
        links: [{ label: "SSRN", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4940136" }]
      },
      {
        type: "paper", year: 2023, date: "2023-10", venue: "arXiv preprint",
        title: "SIG: Rethinking Baseline of Integrated Gradients from the Perspective of Shapley Value",
        authors: ["Shuyang Liu", "Zixuan Chen", "Ge Shi", "Ji Wang", "Changjie Fan", "Yu Xiong", "Runze Wu", "Yujing Hu", "Ze Ji", "Yang Gao"],
        links: [{ label: "arXiv", url: "https://arxiv.org/abs/2310.04821" }]
      },
      {
        type: "paper", year: 2022, date: "2022-08", venue: "KDD 2022",
        title: "Deep Learning for Prognosis Using Task-fMRI: A Novel Architecture and Training Scheme",
        authors: ["Ge Shi", "Jason Smucny", "Ian Davidson"],
        links: [{ label: "ACM DL", url: "https://dl.acm.org/doi/abs/10.1145/3534678.3539362" }]
      },
      {
        type: "paper", year: 2022, venue: "NeuroImage: Clinical",
        title: "Data Augmentation with Mixup: Enhancing Performance of a Functional Neuroimaging-Based Prognostic Deep Learning Classifier in Recent Onset Psychosis",
        authors: ["Jason Smucny", "Ge Shi", "Tyler A. Lesh", "Cameron S. Carter", "Ian Davidson"],
        links: [{ label: "Article", url: "https://www.sciencedirect.com/science/article/pii/S2213158222002790" }]
      },
      {
        type: "paper", year: 2022, venue: "Frontiers in Psychiatry",
        title: "Deep Learning in Neuroimaging: Overcoming Challenges With Emerging Approaches",
        authors: ["Jason Smucny", "Ge Shi", "Ian Davidson"],
        links: [{ label: "PMC", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9200984/" }]
      }

      // Examples of the other types:
      // { type: "blog",  year: 2026, venue: "Blog", title: "What I learned building a browser agent", links: [{ label: "Read", url: "https://..." }] },
      // { type: "media", year: 2026, venue: "Live demo", title: "Agent that files my expense reports", links: [{ label: "Try it", url: "https://..." }, { label: "Code", url: "https://github.com/..." }] },
      // { type: "media", year: 2026, venue: "Podcast", title: "Interview on agentic automation", links: [{ label: "Listen", url: "https://..." }] }
    ],

    // Professional service, grouped by role. A role with no venues is hidden.
    // years is optional; consecutive years are shown as a range (2024 to 2027).
    service: [
      {
        role: "Conference reviewer",
        venues: [
          { name: "NeurIPS", years: [2026] },
          { name: "ICML", years: [2026] },
          { name: "ICLR", years: [2027] },
          { name: "AAAI", years: [2024, 2025, 2026, 2027] },
          { name: "ACL Rolling Review (ARR)", years: [2026] },
          { name: "IEEE VIS", years: [2024] }
        ]
      },
      {
        role: "Journal reviewer",
        venues: [
          { name: "Nature Cities" },
          { name: "Data Mining and Knowledge Discovery" },
          { name: "Frontiers in Medicine" },
          { name: "Frontiers in Neuroscience" }
        ]
      },
      { role: "Chair and organizer", venues: [] },
      { role: "Workshop host", venues: [] }
    ]
  },

  life: {
    intro: "Trips, events, and milestones away from the keyboard.",
    // Newest first is automatic. date is "YYYY-MM" and drives the Recent filter.
    stories: [
      {
        type: "event", title: "Oral presentation at the Consumer Science Summit", place: "San Diego, California", date: "2026-04",
        image: "assets/photos/2026-04-consumer-science-summit-talk.jpg",
        alt: "Ge presenting at a podium in a hotel ballroom, with slides on screen and an audience at round tables",
        text: "Presenting my work in an oral session at Amazon's Consumer Science Summit."
      },
      {
        type: "event", title: "Evening at the Consumer Science Summit", place: "San Diego, California", date: "2026-04",
        image: "assets/photos/2026-04-consumer-science-summit-evening.jpg",
        alt: "Attendees talking around outdoor tables at dusk, with palm trees and string lights",
        text: "Conversations with fellow scientists at the summit's evening reception."
      },
      {
        type: "milestone", title: "Technical Fearlessness Award", place: "Amazon", date: "2026-01",
        image: "assets/photos/2026-01-technical-fearlessness-award.jpg",
        alt: "Round glass award engraved Technical Fearlessness Award, Q1 2026, Ge Shi",
        text: "Received the Technical Fearlessness Award for Q1 2026."
      },
      {
        type: "travel", title: "Joshua Tree National Park", place: "California", date: "2025-12",
        image: "assets/photos/2025-12-joshua-tree-national-park.jpg",
        alt: "Ge standing beside the Entering Joshua Tree National Park sign under a deep blue sky",
        text: "A December trip to the desert at Joshua Tree."
      },
      {
        type: "milestone", title: "One year at Amazon", place: "Amazon", date: "2025-07",
        image: "assets/photos/2025-07-first-year-at-amazon.jpg",
        alt: "Ge and three colleagues standing in front of office windows overlooking city buildings",
        text: "Marking my first year at Amazon with teammates."
      },
      {
        type: "travel", title: "Downtown Napa", place: "Napa, California", date: "2024-07",
        image: "assets/photos/2024-07-napa-california.jpg",
        alt: "Ge posing next to a street sign listing local wineries and restaurants in downtown Napa",
        text: "A summer visit to Napa."
      },
      {
        type: "event", title: "Presenting at KDD 2022", place: "Washington, DC", date: "2022-08",
        image: "assets/photos/2022-08-kdd-presenter.jpg",
        alt: "Ge and a colleague wearing masks and KDD 2022 badges in the convention center",
        text: "Presenting [Deep Learning for Prognosis Using Task-fMRI](https://dl.acm.org/doi/abs/10.1145/3534678.3539362) at KDD 2022."
      },
      {
        type: "milestone", title: "My desk at Berkeley Lab", place: "Lawrence Berkeley National Laboratory", date: "2023-06",
        image: "assets/photos/2023-06-desk-at-berkeley-lab.jpg",
        alt: "Desk name plate for office 4019S in Wang Hall at Lawrence Berkeley National Laboratory, with a view of the bay",
        text: "Office 4019S in Wang Hall at Lawrence Berkeley National Laboratory."
      }
    ]
  }
};
