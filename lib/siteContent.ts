// PLACEHOLDERS. Replace with real content.

export type Judge = {
  id: string;
  name: string;
  role: string;
  organization: string;
};

export type Mentor = {
  id: string;
  name: string;
  role: string;
  organization: string;
  expertise?: string;
};

export type Sponsor = {
  id: string;
  name: string;
  category: "Technology Partner" | "Community Partner" | "Sponsor & Supporter";
  description: string;
};

export type Prize = {
  rank: string;
  title: string;
  reward: string;
  description: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  isDateDynamic?: boolean;
};

export const siteJudges: Judge[] = [
  {
    id: "judge-1",
    name: "Judge Name 1",
    role: "Domain Expert / Industry Leader",
    organization: "Organization Name",
  },
  {
    id: "judge-2",
    name: "Judge Name 2",
    role: "Technical Architect / Specialist",
    organization: "Organization Name",
  },
];

export const siteMentors: Mentor[] = [
  {
    id: "mentor-1",
    name: "Mentor Name 1",
    role: "Engineering Mentor",
    organization: "Organization Name",
    expertise: "Full Stack & Cloud Architecture",
  },
  {
    id: "mentor-2",
    name: "Mentor Name 2",
    role: "Product & AI Mentor",
    organization: "Organization Name",
    expertise: "Machine Learning & Product Design",
  },
];

export const siteSponsors: Sponsor[] = [
  {
    id: "sponsor-1",
    name: "Sponsor Name 1",
    category: "Technology Partner",
    description:
      "Provide developers with APIs, cloud credits, tools, platforms, infrastructure, and technology resources.",
  },
  {
    id: "sponsor-2",
    name: "Sponsor Name 2",
    category: "Community Partner",
    description:
      "Help us reach students, developers, creators, and builders through communities, networks, and collaborative initiatives.",
  },
  {
    id: "sponsor-3",
    name: "Sponsor Name 3",
    category: "Sponsor & Supporter",
    description:
      "Support the event through sponsorships, prizes, bounties, mentorship, resources, or other forms of collaboration.",
  },
];

export const sitePrizes: Prize[] = [
  {
    rank: "01",
    title: "Winner",
    reward: "Prize: To be announced",
    description:
      "Recognition for the team delivering an exceptional overall solution combining innovation, execution, and impact.",
  },
  {
    rank: "02",
    title: "Runner-Up",
    reward: "Prize: To be announced",
    description:
      "Recognition for another standout project demonstrating strong technical execution and meaningful problem solving.",
  },
  {
    rank: "03",
    title: "Special Awards",
    reward: "Prize: To be announced",
    description:
      "Additional recognitions may be introduced for exceptional ideas, sponsor challenges, innovation, or technical creativity.",
  },
];

export const siteFAQs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Who can participate in HackIGNISIA?",
    answer:
      "HackIGNISIA is open to students, developers, designers, and innovators from across India. Registration happens exclusively via Unstop and is completely free.",
  },
  {
    id: "faq-2",
    question: "Is HackIGNISIA online or offline?",
    answer:
      "HackIGNISIA 2026 is a national online hackathon. Participants collaborate remotely with their teammates and submit their projects online through this platform.",
  },
  {
    id: "faq-3",
    question: "What are the hackathon tracks?",
    answer:
      "The hackathon features four core tracks: AI & Machine Learning, Web & App Development, Social Impact & Innovation, and Open Innovation.",
  },
  {
    id: "faq-4",
    question: "Is registration free?",
    answer:
      "Yes, registration for HackIGNISIA 2026 is 100% free of cost on Unstop.",
  },
  {
    id: "faq-5",
    question: "When is the project submission window?",
    answer: "",
    isDateDynamic: true,
  },
  {
    id: "faq-6",
    question: "Can I participate without a team?",
    answer: "To be updated by the organizers.",
  },
  {
    id: "faq-7",
    question: "How will projects be judged?",
    answer: "To be updated by the organizers.",
  },
  {
    id: "faq-8",
    question: "Will participants receive certificates?",
    answer: "To be updated by the organizers.",
  },
];
