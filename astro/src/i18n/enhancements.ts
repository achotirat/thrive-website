import type { LocalizedSlug } from './routes';

type Photo = { src: string; alt: string; caption: string };
export interface PageEnhancement {
  heroPhoto: Photo;
  placePhoto: Photo;
  audienceTitle: string;
  audienceIntro: string;
  audience: string[];
  journeyTitle: string;
  journeyIntro: string;
  steps: { title: string; detail: string }[];
  practicalTitle: string;
  practicalBody: string;
  moreFaq: { q: string; a: string }[];
}

export const enhancements: Record<'en', Record<LocalizedSlug, PageEnhancement>> = {
  en: {
    '': {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'Seating area and entrance inside Thrive Wellness Clinic', caption: 'Inside Thrive Wellness Clinic at The Crystal Park, Bangkok' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Reception desk at Thrive Wellness Clinic', caption: 'The reception area at Thrive Wellness Clinic' },
      audienceTitle: 'Where would you like to begin?',
      audienceIntro: 'You do not need to know the name of a test or treatment before contacting us. Start with the question that matters to you.',
      audience: ['Understand ongoing tiredness or changes in how you feel', 'Choose a health check-up based on your goals and history', 'Ask whether IV drip, HBOT or a therapist consultation is suitable'],
      journeyTitle: 'How care starts at Thrive',
      journeyIntro: 'A first conversation helps us direct you to the right person and service.',
      steps: [
        { title: 'Tell us your concern', detail: 'Call, message us on LINE or send the form. Share your main goal and any questions.' },
        { title: 'Discuss the right next step', detail: 'Our team explains the relevant service and helps arrange a consultation when appropriate.' },
        { title: 'Meet at the clinic', detail: 'A clinician reviews your history and discusses any assessment or treatment before it begins.' },
        { title: 'Leave with a plan', detail: 'You can discuss results, practical next steps and whether follow-up is needed.' },
      ],
      practicalTitle: 'A real clinic you can visit',
      practicalBody: 'We are on the second floor of Building B at The Crystal Park, 199 Pradit Manutham Road, Lat Phrao, Bangkok 10230. The clinic is open daily from 10:00 to 19:00. If you need English-speaking support, please request an appointment in advance so we can confirm staff availability.',
      moreFaq: [
        { q: 'Can I visit before choosing a programme?', a: 'Yes. Contact us to arrange a consultation and explain what you would like help with. You do not need to choose a service from the website first.' },
        { q: 'Where is the clinic?', a: 'The clinic is on the second floor of Building B at The Crystal Park, Lat Phrao, Bangkok.' },
      ],
    },
    about: {
      heroPhoto: { src: '/about-clinic.jpg', alt: 'Reception area at Thrive Wellness Clinic', caption: 'The reception area at our Lat Phrao clinic' },
      placePhoto: { src: '/dr-chanakan-trangansri-thrive-400x400.jpg', alt: 'Dr. Chanakan Trangansri at Thrive Wellness Clinic', caption: 'Chanakan Trangansri, MD (Dr. Noon), medical director' },
      audienceTitle: 'What guides our work',
      audienceIntro: 'We want you to understand why a service is recommended and what it can and cannot tell you.',
      audience: ['Assessment begins with your history and goals, not a fixed package', 'The team reviews test results in the context of your symptoms', 'Recommendations and follow-up are discussed with you before you decide'],
      journeyTitle: 'From first visit to follow-up',
      journeyIntro: 'The exact process depends on the service, but the aim is to make each step understandable.',
      steps: [
        { title: 'Listen', detail: 'Tell the team what has changed, what you have tried and what you hope to understand.' },
        { title: 'Assess', detail: 'A clinician may review your history, lifestyle and existing results before suggesting further checks.' },
        { title: 'Explain', detail: 'The team discusses findings and the reasons for any proposed service or care plan.' },
        { title: 'Revisit', detail: 'When follow-up is useful, your plan can be reviewed in light of your response and new information.' },
      ],
      practicalTitle: 'Meet us in person',
      practicalBody: 'Thrive is a physical clinic at The Crystal Park in Bangkok. Opening hours are 10:00–19:00 every day. Please contact us in advance to arrange a visit if you need English-speaking support, as staff availability varies.',
      moreFaq: [
        { q: 'Who leads the clinic?', a: 'Dr. Chanakan Trangansri (Dr. Noon) is the medical director. Her profile and photo are also shown on the Thai About page.' },
        { q: 'Will I see the same plan as everyone else?', a: 'The team discusses your history, findings and goals before recommending next steps. Services are not selected from a single fixed plan for every visitor.' },
      ],
    },
    contact: {
      heroPhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic reception desk', caption: 'Visit our reception on the second floor of Building B' },
      placePhoto: { src: '/thrive-clinic-home.jpg', alt: 'Waiting area inside Thrive Wellness Clinic', caption: 'A view inside the clinic before your appointment' },
      audienceTitle: 'Choose how to get in touch',
      audienceIntro: 'Ask a question, check appointment availability or tell us which service you are considering.',
      audience: ['Call 095-934-9640 during opening hours', 'Message LINE @thrivewellnessth', 'Send the appointment form below and leave a number we can reach'],
      journeyTitle: 'What happens after you contact us',
      journeyIntro: 'Our team can help you prepare for a visit without asking you to choose a treatment in advance.',
      steps: [
        { title: 'Send your enquiry', detail: 'Tell us your preferred service, main concern and a convenient way to contact you.' },
        { title: 'Confirm the details', detail: 'The team can discuss availability, the type of appointment and anything to bring.' },
        { title: 'Come to The Crystal Park', detail: 'Find us in Building B, second floor, at 199 Pradit Manutham Road.' },
      ],
      practicalTitle: 'Plan your visit',
      practicalBody: 'The clinic is open daily from 10:00 to 19:00. The Crystal Park has parking. Please request your appointment in advance if you need English-speaking support. Our team will confirm staff and service availability, along with any preparation, before your visit.',
      moreFaq: [
        { q: 'What should I bring to a consultation?', a: 'If you have recent test results, a medication list or questions for the clinician, bring them with you. Our team can confirm any service-specific preparation when you book.' },
        { q: 'Can I ask about price before booking?', a: 'Yes. Tell us which service you are considering. The team can explain the current price and what is included before you confirm an appointment.' },
      ],
    },
    'iv-drip': {
      heroPhoto: { src: '/iv-drip-hero.jpg', alt: 'IV drip treatment chairs inside Thrive Wellness Clinic', caption: 'The IV drip room at Thrive Wellness Clinic' },
      placePhoto: { src: '/iv-drip-customer-03.webp', alt: 'Clinic staff assisting a visitor during an IV drip session', caption: 'A care moment photographed for Thrive’s Thai IV Drip page' },
      audienceTitle: 'Questions worth discussing before an IV drip',
      audienceIntro: 'An IV drip is a medical procedure, so the right starting point is your history and reason for considering it.',
      audience: ['What is your goal, and could another approach address it?', 'Do you have kidney, heart or fluid-balance concerns?', 'Which ingredients, dose, duration and price apply to the proposed programme?'],
      journeyTitle: 'What an appointment may involve',
      journeyIntro: 'Your clinician confirms the exact programme and whether an IV drip is appropriate for you.',
      steps: [
        { title: 'Discuss your health', detail: 'Share your medical conditions, medicines, allergies and the outcome you hope for.' },
        { title: 'Review a recommendation', detail: 'Ask what the suggested formulation contains, why it is proposed and what alternatives exist.' },
        { title: 'Attend the session', detail: 'The team explains the procedure and monitors you during the infusion. Duration varies by formulation.' },
        { title: 'Know what to watch for', detail: 'Ask about aftercare and whom to contact if you have a concern after leaving.' },
      ],
      practicalTitle: 'See the treatment space',
      practicalBody: 'The photograph shows the IV drip room used on Thrive’s Thai service page. Programme availability, ingredients and session time can vary; contact the clinic for current details before booking.',
      moreFaq: [
        { q: 'How long does a session take?', a: 'It depends on the selected formulation. Ask the team for the expected duration when they confirm the programme.' },
        { q: 'Is an IV drip appropriate for everyone?', a: 'No. A clinician should review your medical history, medicines and fluid-balance risks before recommending an IV treatment.' },
      ],
    },
    'check-up': {
      heroPhoto: { src: '/check-up-hero.jpg', alt: 'Private consultation and examination room at Thrive Wellness Clinic', caption: 'A consultation room at Thrive Wellness Clinic' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Reception at Thrive Wellness Clinic', caption: 'The clinic reception where your visit begins' },
      audienceTitle: 'Choose tests for a reason',
      audienceIntro: 'A useful check-up starts with the questions you want answered. The team can help narrow the options.',
      audience: ['Review an existing health concern or family history', 'Understand whether hormone, nutrition or specialist testing is relevant', 'Discuss results with a clinician rather than reading numbers alone'],
      journeyTitle: 'From enquiry to results',
      journeyIntro: 'The tests, preparation and timing differ by programme. The team can explain the plan before you commit.',
      steps: [
        { title: 'Share your goals', detail: 'Tell us about symptoms, previous results, medicines and what you want to learn.' },
        { title: 'Select an assessment', detail: 'A clinician or team member explains the relevant programme, included tests and preparation.' },
        { title: 'Complete the tests', detail: 'Attend the clinic for sample collection or assessment as required by your programme.' },
        { title: 'Review the findings', detail: 'Discuss results, their limits and any next steps with a clinician.' },
      ],
      practicalTitle: 'What to confirm before booking',
      practicalBody: 'Ask which tests are included, whether fasting or other preparation is required, when results are expected, and whether a results consultation is included. Details vary across check-up programmes.',
      moreFaq: [
        { q: 'Do I need to fast?', a: 'It depends on the tests in your programme. Please confirm preparation with the clinic before your appointment.' },
        { q: 'Will someone explain my results?', a: 'The Thai check-up page describes clinician interpretation of results. Confirm the consultation format for the programme you choose.' },
      ],
    },
    hbot: {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'Interior of Thrive Wellness Clinic at The Crystal Park', caption: 'Visit the physical Thrive clinic in Bangkok' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic reception area', caption: 'Our clinic reception at The Crystal Park' },
      audienceTitle: 'Before considering HBOT',
      audienceIntro: 'Hyperbaric oxygen therapy is a pressurised treatment. A discussion with the team helps establish whether it is suitable for your situation.',
      audience: ['What is the reason you are considering HBOT?', 'Do you have ear, sinus, lung or other medical concerns to disclose?', 'What are the planned session length, pressure and number of visits?'],
      journeyTitle: 'What to expect',
      journeyIntro: 'The team should explain the equipment and procedure before any session.',
      steps: [
        { title: 'Discuss suitability', detail: 'Share your medical history, current symptoms and the goal of treatment.' },
        { title: 'Review the session plan', detail: 'Ask about the chamber, pressure changes, session length and possible discomfort.' },
        { title: 'Attend with guidance', detail: 'Follow the team’s instructions during pressure changes and tell them if you feel unwell.' },
        { title: 'Discuss next steps', detail: 'Ask what to expect afterwards and whether further sessions are appropriate.' },
      ],
      practicalTitle: 'See the clinic; ask to see the HBOT equipment',
      practicalBody: 'The photographs here show our clinic. They do not show an HBOT chamber. Contact the team to confirm the current equipment and arrange to see the treatment setting before booking.',
      moreFaq: [
        { q: 'Does HBOT replace other medical care?', a: 'No. Discuss your condition and existing treatment with a qualified clinician before considering HBOT.' },
        { q: 'Is the chamber shown in these photos?', a: 'No. These are photographs of the clinic. Ask the team for current HBOT equipment photos or to see the chamber in person.' },
      ],
    },
    chelation: {
      heroPhoto: { src: '/iv-drip-hero.jpg', alt: 'IV drip treatment chairs inside Thrive Wellness Clinic', caption: 'The IV drip room at Thrive Wellness Clinic. This photo shows the room, not a chelation session.' },
      placePhoto: { src: '/dr-chanakan-trangansri-thrive-400x400.jpg', alt: 'Dr. Chanakan Trangansri at Thrive Wellness Clinic', caption: 'Dr. Chanakan Trangansri (Dr. Noon) leads care at Thrive Wellness Clinic' },
      audienceTitle: 'Who this page is for',
      audienceIntro: 'Chelation is a medical decision. It works best when it starts with a clear question and a test result.',
      audience: ['You have a test result showing a high level of a heavy metal, such as lead', 'You had a known exposure at work or at home and want a medical opinion', 'You were told chelation helps the heart or "detoxes" the body and want to check the facts', 'You want a clear, honest explanation before deciding anything'],
      journeyTitle: 'What a visit involves',
      journeyIntro: 'The aim is to decide together whether an EDTA drip makes sense for you, before any drip is planned.',
      steps: [
        { title: 'Ask first', detail: 'Contact the clinic by form, phone or LINE. Say what you are hoping to understand and request English-speaking support in advance.' },
        { title: 'Review your history', detail: 'The doctor asks about your health, medicines, work and possible exposure, and looks at any test results you bring.' },
        { title: 'Check suitability', detail: 'Kidney function and other safety checks come before any drip. The doctor explains the benefits, limits and risks in plain language.' },
        { title: 'Plan and monitor', detail: 'If an EDTA drip is suitable, the doctor sets out the plan and follow-up checks. If not, you will hear why and what other options exist.' },
      ],
      practicalTitle: 'Before you book',
      practicalBody: 'Bring previous blood or urine results and a list of your medicines and supplements. Please do not start a chelation product on your own. If you have heart disease or kidney disease, tell the team when you contact us. We do not promise outcomes, and a consultation does not mean a drip will be recommended.',
      moreFaq: [
        { q: 'How long does a session take?', a: 'It depends on the plan your doctor sets. At Thrive, a drip is usually planned at about 60 to 90 minutes. Please ask the team to confirm the timing for your plan.' },
        { q: 'Is chelation given by IV or by mouth?', a: 'Chelation medicines can be given by mouth or by IV, depending on the metal and the treatment plan [3]. This page covers the IV EDTA drip. Ask our doctor which route, if any, suits your situation.' },
      ],
    },
    'mental-health': {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'Quiet seating area inside Thrive Wellness Clinic', caption: 'A quiet space inside Thrive Wellness Clinic' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic reception desk', caption: 'The clinic reception at The Crystal Park' },
      audienceTitle: 'You can start with a conversation',
      audienceIntro: 'You do not need a diagnosis to ask about support. Tell the team what has been difficult recently.',
      audience: ['Stress or burnout affecting work and daily life', 'Sleep, mood or worry that you want to talk through', 'Questions about therapist consultations and other support options'],
      journeyTitle: 'How to begin',
      journeyIntro: 'The first step is to find an appointment and professional fit that suits your needs.',
      steps: [
        { title: 'Reach out', detail: 'Contact the clinic by form, phone or LINE and ask about therapist availability.' },
        { title: 'Confirm the format', detail: 'Ask who you will meet, the session format, duration and current price.' },
        { title: 'Have a private conversation', detail: 'Discuss your concerns, goals and what kind of support you are looking for.' },
        { title: 'Plan the next step', detail: 'The professional can discuss whether follow-up or another type of care is appropriate.' },
      ],
      practicalTitle: 'Support with clear boundaries',
      practicalBody: 'A therapist consultation is for planned, non-emergency support. It does not replace emergency or specialist psychiatric care. If you have an immediate safety concern, seek local emergency help now rather than waiting for a form response.',
      moreFaq: [
        { q: 'Do I need to know what is wrong before booking?', a: 'No. You can describe what you are experiencing and ask the team which kind of appointment may suit you.' },
        { q: 'Is a therapist the same as a psychiatrist?', a: 'They have different roles. A psychiatrist is a medical doctor who can diagnose and prescribe medication. Ask the clinic who will provide your appointment and what the session covers.' },
      ],
    },
  },
};
