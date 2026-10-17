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

export const pages: Record<'en' | 'zh-cn', Record<LocalizedSlug, LocalizedPageData>> = {
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
        { q: 'Do I need an appointment?', a: 'We recommend booking ahead. Contact our team on LINE @thrivewellnessth or call 095-934-9640.' },
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
        { q: 'Can I walk in?', a: 'Walk-ins are welcome, but booking ahead helps us arrange enough time for your consultation.' },
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
  'zh-cn': {
    '': {
      title: 'Thrive Wellness Clinic 曼谷｜个性化健康管理',
      description: '了解曼谷 Thrive Wellness Clinic 的功能医学、深度健康检查、静脉营养、HBOT 和心理健康服务。',
      eyebrow: 'Thrive Wellness Clinic · 曼谷',
      heading: '更深入地了解您的健康',
      intro: '如果疲劳或其他健康困扰反复出现，更深入的评估或许能帮助您找到下一步。Thrive 根据检查结果和个人目标制定照护方案。',
      sections: [
        { heading: '以您为中心的照护', body: '我们的团队会综合您的症状、检查结果、生活方式和健康目标，再讨论适合的方案。', points: ['深度健康检查', '静脉营养疗程', '高压氧治疗（HBOT）', '心理健康与治疗师咨询'] },
        { heading: '欢迎来到曼谷诊所', body: 'Thrive 位于曼谷 Lat Phrao 的 The Crystal Park B 栋二楼，每天 10:00–19:00 营业。' },
      ],
      faq: [
        { q: '需要提前预约吗？', a: '建议提前预约。您可以通过 LINE @thrivewellnessth 或致电 095-934-9640 联系我们。' },
        { q: '可以先咨询适合的项目吗？', a: '可以。请告诉团队您的健康目标和顾虑，我们可以协助安排咨询。' },
      ],
      cta: '咨询预约',
    },
    about: {
      title: '关于 Thrive Wellness Clinic 曼谷',
      description: '了解 Thrive Wellness Clinic 的个性化照护理念，以及位于曼谷的功能医学与预防医学服务。',
      eyebrow: '关于 Thrive',
      heading: '从症状出发，深入了解健康',
      intro: 'Thrive Wellness Clinic 将深入评估与个性化照护相结合，与您一起了解健康问题并规划下一步。',
      sections: [
        { heading: '我们的理念', body: '我们会综合病史、生活方式、检查结果和个人目标，了解可能影响健康的因素，并讨论适合您的照护方案。' },
        { heading: '医疗团队', body: 'Chanakan Trangansri 医生（Dr. Noon）带领团队提供抗衰老与再生医学相关照护，并关注功能医学及营养健康。' },
        { heading: '诊所位置', body: '曼谷 Lat Phrao，Pradit Manutham Road 199 号 The Crystal Park B 栋二楼。每天 10:00–19:00 营业。' },
      ],
      faq: [{ q: 'Thrive 提供哪些服务？', a: '服务包括健康检查、食物敏感性检测、激素评估、静脉营养、高压氧治疗和个性化健康管理。' }],
      cta: '联系团队',
    },
    contact: {
      title: '联系与预约｜Thrive Wellness Clinic',
      description: '预约曼谷 Thrive Wellness Clinic。致电 095-934-9640，或通过 LINE @thrivewellnessth 联系我们。',
      eyebrow: '联系我们',
      heading: '联系与预约',
      intro: '请选择方便的联系方式。我们的团队每天 10:00–19:00 为您服务。',
      sections: [
        { heading: '电话或在线联系', body: '致电 095-934-9640，或通过 LINE @thrivewellnessth 咨询服务及预约时间。' },
        { heading: '前往诊所', body: '曼谷 Lat Phrao，Pradit Manutham Road 199 号 The Crystal Park B 栋二楼。商场设有停车场。' },
      ],
      faq: [
        { q: '可以直接到访吗？', a: '可以直接到访，但建议提前预约，以便我们为咨询安排充足时间。' },
        { q: '诊所的营业时间是什么？', a: '每天 10:00–19:00 营业。' },
      ],
      cta: '发送预约申请',
    },
    'iv-drip': {
      title: '曼谷静脉营养疗程｜Thrive Wellness Clinic',
      description: '了解曼谷 Thrive Wellness Clinic 的个性化静脉营养疗程，并与医疗团队讨论您的健康目标。',
      eyebrow: '静脉营养',
      heading: '根据您的目标选择静脉营养方案',
      intro: '医疗团队会结合您的健康史与目标，讨论静脉营养疗程是否适合您。欢迎联系我们了解可选方案。',
      sections: [
        { heading: '疗程选择', body: '泰文服务目录包括 Gut Health IV、Essential Booster、谷胱甘肽等项目。具体供应情况及适用性请在咨询时确认。' },
        { heading: '疗程前', body: '请向团队说明病史、正在使用的药物及健康顾虑，以便医疗人员评估是否适合。' },
      ],
      faq: [{ q: '我应该选择哪种静脉营养疗程？', a: '请先咨询医疗团队。建议方案需结合您的健康史和目标。' }],
      cta: '咨询静脉营养',
    },
    'check-up': {
      title: '曼谷深度健康检查｜Thrive Wellness Clinic',
      description: '了解 Thrive Wellness Clinic 的个性化健康检查，包括食物敏感性、激素及其他专项评估。',
      eyebrow: '健康检查',
      heading: '更深入地了解身体发出的信号',
      intro: '我们的团队可根据您的健康顾虑和目标，协助选择适合的深度健康评估项目。',
      sections: [
        { heading: '评估方向', body: '项目涵盖食物敏感性、激素平衡、DNA 健康、营养状态等专项评估。适合的检查因人而异。' },
        { heading: '从结果到下一步', body: '医疗人员会结合症状和病史解读结果，并与您讨论后续建议。' },
      ],
      faq: [{ q: '我适合哪种健康检查？', a: '请告诉团队您的症状和目标，我们可以协助安排咨询并讨论适合的评估。' }],
      cta: '咨询健康检查',
    },
    hbot: {
      title: '曼谷高压氧治疗 HBOT｜Thrive Wellness Clinic',
      description: '了解曼谷 Thrive Wellness Clinic 的高压氧治疗（HBOT），并与医疗团队讨论是否适合您。',
      eyebrow: '高压氧治疗',
      heading: '在医疗指导下了解 HBOT',
      intro: 'Thrive Wellness Clinic 提供高压氧治疗（HBOT）。预约前请与团队讨论病史和健康目标。',
      sections: [
        { heading: '什么是 HBOT？', body: 'HBOT 是在加压舱内吸入氧气的治疗方式。医疗人员可根据您的情况说明流程、可能的益处及局限。' },
        { heading: '是否适合您？', body: '适用性取决于个人病史。请在疗程前告知团队现有疾病和相关顾虑。' },
      ],
      faq: [{ q: 'HBOT 前需要咨询医疗人员吗？', a: '需要。请先说明您的病史和目标，以便团队评估适用性。' }],
      cta: '咨询 HBOT',
    },
    'mental-health': {
      title: '曼谷心理健康支持｜Thrive Wellness Clinic',
      description: '了解曼谷 Thrive Wellness Clinic 的心理健康支持与治疗师咨询服务。',
      eyebrow: '心理健康',
      heading: '为心理健康留出空间',
      intro: '如果压力、情绪低落或倦怠影响了日常生活，欢迎与团队讨论 Thrive 可提供的支持。',
      sections: [
        { heading: '与治疗师交谈', body: '治疗师咨询为您提供讨论顾虑和探索下一步的空间。请联系我们了解预约情况。' },
        { heading: '关注整体健康', body: '诊所的其他服务可帮助您与合适的专业人员讨论身体和心理健康。' },
      ],
      faq: [{ q: '如何预约治疗师咨询？', a: '请通过 LINE @thrivewellnessth 或致电 095-934-9640 联系诊所，了解可预约时间。' }],
      cta: '咨询心理健康支持',
    },
  },
};
