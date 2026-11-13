import type { LocalizedSlug } from './routes';

export interface LocalizedPageData {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  sections: { heading: string; body: string; points?: string[] }[];
  faq: { q: string; a: string }[];
  cta: string;
}

export const pages: Record<'en', Record<LocalizedSlug, LocalizedPageData>> = {
  en: {
    '': {
      title: 'Thrive Wellness Clinic Bangkok | Personalised Wellness Care',
      description: 'Explore functional medicine, health check-ups, IV drips, HBOT and mental health support at Thrive Wellness Clinic in Bangkok.',
      eyebrow: 'Thrive Wellness Clinic · Bangkok',
      heading: 'Understand your health more deeply',
      intro: 'When tiredness or other concerns keep coming back, a closer look can help. Thrive combines detailed assessment with care tailored to your health goals.',
      sections: [
        { heading: 'Care built around you', body: 'Our team considers your symptoms, test results, lifestyle and goals before recommending a plan. Speak with us about which service is appropriate for you.', points: ['In-depth health check-ups', 'IV drip programmes', 'Hyperbaric oxygen therapy (HBOT)', 'Mental health and therapist consultations'] },
        { heading: 'Visit us in Bangkok', body: 'Find Thrive on the second floor of Building B at The Crystal Park, Lat Phrao. We are open daily from 10:00 to 19:00.' },
      ],
      faq: [
        { q: 'Do I need an appointment?', a: 'If you need English-speaking support, please request an appointment in advance. English-speaking staff are not available every day. Contact our team on LINE @thrivewellnessth or call 095-934-9640 to confirm a suitable date.' },
        { q: 'Can I discuss which programme suits me?', a: 'Yes. Tell our team about your goals and concerns, and we can help you arrange a consultation.' },
      ],
      cta: 'Ask about a consultation',
    },
    about: {
      title: 'About Thrive Wellness Clinic Bangkok',
      description: 'Meet Thrive Wellness Clinic in Bangkok and learn about our personalised approach to functional and preventive medicine.',
      eyebrow: 'About Thrive',
      heading: 'Care that looks beyond the symptoms',
      intro: 'Thrive Wellness Clinic brings together in-depth assessment and personalised care. Our team works with you to understand your health concerns and plan next steps.',
      sections: [
        { heading: 'Our approach', body: 'We consider your history, lifestyle, test results and goals together. The aim is to identify factors that may be contributing to your symptoms and tailor care to your needs.' },
        { heading: 'Our medical team', body: 'Dr. Chanakan Trangansri (Dr. Noon) leads care in anti-aging and regenerative medicine, with a focus on functional medicine and nutrition wellness.' },
        { heading: 'Where to find us', body: 'The clinic is at The Crystal Park, Building B, second floor, 199 Pradit Manutham Road, Lat Phrao, Bangkok 10230. Open daily, 10:00–19:00.' },
      ],
      faq: [{ q: 'What services does Thrive offer?', a: 'Services include health check-ups, food sensitivity testing, hormone assessment, IV drips, HBOT and personalised wellness care.' }],
      cta: 'Talk with our team',
    },
    contact: {
      title: 'Contact and Appointments | Thrive Wellness Clinic',
      description: 'Book an appointment at Thrive Wellness Clinic Bangkok. Call 095-934-9640 or contact us on LINE @thrivewellnessth.',
      eyebrow: 'Contact',
      heading: 'Contact and appointments',
      intro: 'Choose the easiest way to reach us. Our team is available daily from 10:00 to 19:00.',
      sections: [
        { heading: 'Call or message us', body: 'Call 095-934-9640 or message LINE @thrivewellnessth to ask about services and appointment times.' },
        { heading: 'Visit the clinic', body: 'Building B, second floor, The Crystal Park, 199 Pradit Manutham Road, Lat Phrao, Bangkok 10230. Parking is available at the centre.' },
      ],
      faq: [
        { q: 'Can I walk in?', a: 'The clinic is open daily, but English-speaking staff are not available every day. Please contact us in advance if you need English-speaking support and wait for our team to confirm your appointment before visiting.' },
        { q: 'When is the clinic open?', a: 'We are open daily from 10:00 to 19:00.' },
      ],
      cta: 'Send an appointment request',
    },
    'iv-drip': {
      title: 'IV Drip Therapy Bangkok | Thrive Wellness Clinic',
      description: 'Explore personalised IV drip programmes at Thrive Wellness Clinic Bangkok. Discuss your health goals with our medical team.',
      eyebrow: 'IV Drip',
      heading: 'IV drip care tailored to your goals',
      intro: 'Our IV drip programmes are discussed with the medical team in the context of your health history and goals. Ask us which options may be suitable for you.',
      sections: [
        { heading: 'Programme options', body: 'The Thai service menu includes Gut Health IV, Essential Booster, Glutathione and other IV options. Availability and suitability should be confirmed during consultation.' },
        { heading: 'Before treatment', body: 'Share your medical history, current medicines and concerns with the team. A clinician can advise whether an IV programme is appropriate.' },
      ],
      faq: [{ q: 'Which drip should I choose?', a: 'Please speak with our medical team. The recommendation depends on your health history and goals.' }],
      cta: 'Ask about IV drips',
    },
    'check-up': {
      title: 'In-depth Health Check-ups Bangkok | Thrive Wellness Clinic',
      description: 'Explore personalised health check-ups at Thrive Wellness Clinic Bangkok, including food sensitivity, hormone and other specialist assessments.',
      eyebrow: 'Health Check-ups',
      heading: 'Look closer at what your body is telling you',
      intro: 'Choose from in-depth health assessment programmes with guidance from our team. We can help you identify which tests match your concerns and goals.',
      sections: [
        { heading: 'Assessment areas', body: 'Our programme range includes food sensitivity, hormone balance, DNA health, nutritional status and other specialist assessments. The right tests depend on your situation.' },
        { heading: 'From results to a plan', body: 'Results are considered alongside your symptoms and history. Your clinician can explain findings and discuss practical next steps.' },
      ],
      faq: [{ q: 'Which check-up programme is right for me?', a: 'Tell our team about your symptoms and goals. They can help arrange a consultation and recommend an appropriate assessment.' }],
      cta: 'Ask about a check-up',
    },
    hbot: {
      title: 'HBOT in Bangkok | Thrive Wellness Clinic',
      description: 'Learn about hyperbaric oxygen therapy (HBOT) at Thrive Wellness Clinic Bangkok and discuss suitability with our medical team.',
      eyebrow: 'Hyperbaric Oxygen Therapy',
      heading: 'Explore HBOT with clinical guidance',
      intro: 'Hyperbaric oxygen therapy (HBOT) is offered at Thrive Wellness Clinic. Discuss your health history and goals with our team before booking.',
      sections: [
        { heading: 'What is HBOT?', body: 'HBOT involves breathing oxygen in a pressurised chamber. A clinician can explain the process, possible benefits and limitations for your circumstances.' },
        { heading: 'Is it suitable for you?', body: 'Suitability depends on your medical history. Let the team know about current conditions and any concerns before a session.' },
      ],
      faq: [{ q: 'Should I consult a clinician before HBOT?', a: 'Yes. Please discuss your medical history and goals with our team so suitability can be assessed.' }],
      cta: 'Ask about HBOT',
    },
    'mental-health': {
      title: 'Mental Health Support Bangkok | Thrive Wellness Clinic',
      description: 'Learn about mental health support and therapist consultations at Thrive Wellness Clinic Bangkok.',
      eyebrow: 'Mental Health',
      heading: 'Make space for your mental wellbeing',
      intro: 'If stress, low mood or burnout is affecting daily life, you can speak with our team about the support available at Thrive.',
      sections: [
        { heading: 'Talk with a therapist', body: 'Therapist consultations offer a place to discuss your concerns and explore next steps. Contact us to ask about appointment availability.' },
        { heading: 'Care that considers the whole person', body: 'Our wider clinic services can help you discuss both physical and mental wellbeing with the appropriate professionals.' },
      ],
      faq: [{ q: 'How do I book a therapist consultation?', a: 'Contact the clinic by LINE @thrivewellnessth or call 095-934-9640 to ask about availability.' }],
      cta: 'Ask about mental health support',
    },
  },
};
