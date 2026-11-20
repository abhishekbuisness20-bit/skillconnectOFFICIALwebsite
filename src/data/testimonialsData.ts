export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  state: string;
  category: 'trades' | 'tech' | 'mentorship';
  badge: string;
  rating: number;
  date: string;
  quote: string;
  featureTested: string;
  avatarInitials: string;
  avatarColor: string;
}

export const COMMUNITY_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Ramesh Verma',
    role: 'Licensed Electrical Contractor',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    category: 'trades',
    badge: 'Verified Trade Tester',
    rating: 5,
    date: 'October 2026',
    quote:
      'In traditional aggregators, middlemen siphon 25% to 30% of our hard-earned daily fee. Testing SkillConnect’s direct geo-matching and verified client dispatch in Kanpur showed me how a genuine marketplace should work. The verification badge establishes instant homeowner trust before I arrive on site.',
    featureTested: 'Real-Time Geo Matching',
    avatarInitials: 'RV',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'test-2',
    name: 'Priya Sharma',
    role: 'Full-Stack Developer & Creator',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    category: 'tech',
    badge: 'Beta Batch #1 Tester',
    rating: 5,
    date: 'October 2026',
    quote:
      'The peer-to-peer skill barter mechanism is revolutionary for young creators across India. I tested exchanging TypeScript API design guidance for UI/UX interaction critiques with an architect in Bengaluru. Zero rupee friction, purely verified reciprocal learning.',
    featureTested: 'Skill Barter Protocol',
    avatarInitials: 'PS',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'test-3',
    name: 'Vikram Patel',
    role: 'Senior Systems Architect & Mentor',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'mentorship',
    badge: 'Community Mentor',
    rating: 5,
    date: 'September 2026',
    quote:
      'Most platforms treat mentorship as an unfocused meeting without accountability. SkillConnect structures each session around agenda attachments, verifiable code repositories, and milestone deliverables. Abhishek Singh’s architecture prioritizes authentic talent empowerment.',
    featureTested: '1-on-1 Mentorship Channels',
    avatarInitials: 'VP',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'test-4',
    name: 'Ananya Sen',
    role: 'Final-Year Computer Science Scholar',
    city: 'New Delhi',
    state: 'Delhi NCR',
    category: 'tech',
    badge: 'Student Beta Tester',
    rating: 5,
    date: 'October 2026',
    quote:
      'Securing genuine apprenticeships without spammy placement recruiters is a major hurdle for Indian students. SkillConnect’s cryptographic proof-of-work portfolio lets me showcase verified GitHub pull requests directly to regional companies without third-party gatekeeping.',
    featureTested: 'Proof-of-Work Badges',
    avatarInitials: 'AS',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'test-5',
    name: 'Mohammad Tariq',
    role: 'Sanitation & Pipeline Specialist',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'trades',
    badge: 'Early Access Partner',
    rating: 5,
    date: 'October 2026',
    quote:
      'The mobile UI works smoothly on budget smartphones even with variable network speeds. During our Varanasi district beta test, notifications for local repair inquiries arrived promptly without annoying full-screen advertisement distractions.',
    featureTested: 'Low-Bandwidth Mobile Dispatch',
    avatarInitials: 'MT',
    avatarColor: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'test-6',
    name: 'Sunita Rao',
    role: 'Vocational Trainer & Educator',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'mentorship',
    badge: 'Governance Reviewer',
    rating: 5,
    date: 'October 2026',
    quote:
      'Founder and administrative accountability is rarely seen in the tech aggregator space. Having Abhishek Singh and his administration members (Abhay Singh, Adarsh Singh, Abhay Bharti) visibly coordinate safety, verification, and dispute resolution creates unprecedented trust ahead of launch.',
    featureTested: 'Transparent Administration',
    avatarInitials: 'SR',
    avatarColor: 'from-rose-500 to-pink-600',
  },
];
