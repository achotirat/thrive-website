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

export const enhancements: Record<'en' | 'zh-cn', Record<LocalizedSlug, PageEnhancement>> = {
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
  'zh-cn': {
    '': {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'Thrive Wellness Clinic 的等候区和入口', caption: '位于曼谷 The Crystal Park 的 Thrive Wellness Clinic 实景' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 的接待处', caption: '到访时可在诊所接待处与团队联系' },
      audienceTitle: '您想从哪里开始？',
      audienceIntro: '联系我们之前，您不必先选好检查或疗程。可以先告诉我们最想了解的问题。',
      audience: ['了解持续疲劳或身体状态变化的可能原因', '根据目标和病史选择健康检查', '询问静脉营养、HBOT 或治疗师咨询是否适合自己'],
      journeyTitle: '在 Thrive 开始健康管理',
      journeyIntro: '首次沟通有助于我们为您安排合适的人员和服务。',
      steps: [
        { title: '告诉我们您的顾虑', detail: '通过电话、LINE 或表单说明主要目标和问题。' },
        { title: '讨论下一步', detail: '团队解释相关服务，并在适合时协助安排咨询。' },
        { title: '到访诊所', detail: '医疗人员了解病史，并在检查或疗程开始前说明安排。' },
        { title: '了解后续计划', detail: '讨论检查结果、实际建议，以及是否需要复诊。' },
      ],
      practicalTitle: '可亲自到访的实体诊所',
      practicalBody: '诊所位于曼谷 Lat Phrao，Pradit Manutham Road 199 号 The Crystal Park B 栋二楼。每天 10:00–19:00 营业。如需中文沟通，请提前预约，以便团队确认可提供语言支持的时间。',
      moreFaq: [
        { q: '还没选好项目，也可以先咨询吗？', a: '可以。请告诉团队您的顾虑，我们可以协助安排咨询，不需要先从网站上选定服务。' },
        { q: '诊所在哪里？', a: 'Thrive 位于曼谷 Lat Phrao 的 The Crystal Park B 栋二楼。' },
      ],
    },
    about: {
      heroPhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 接待区', caption: '位于 Lat Phrao 的诊所接待区' },
      placePhoto: { src: '/dr-chanakan-trangansri-thrive-400x400.jpg', alt: 'Thrive Wellness Clinic 的 Chanakan Trangansri 医生', caption: '医疗总监 Chanakan Trangansri 医生（Dr. Noon）' },
      audienceTitle: '我们的工作原则',
      audienceIntro: '我们希望您了解为何建议某项服务，以及它能提供什么信息、有哪些局限。',
      audience: ['从病史和目标出发，而非直接套用固定套餐', '结合症状解读检查结果', '在您决定之前解释建议和后续安排'],
      journeyTitle: '从初次到访到后续跟进',
      journeyIntro: '具体流程因服务而异，但每一步都应清楚易懂。',
      steps: [
        { title: '倾听', detail: '告诉团队身体和生活中的变化、已经尝试的方法，以及您希望了解的事。' },
        { title: '评估', detail: '医疗人员可结合病史、生活方式和既有结果，讨论是否需要进一步检查。' },
        { title: '解释', detail: '团队说明结果，以及建议某项服务或照护方案的原因。' },
        { title: '回顾', detail: '如需跟进，可依据您的反应和新信息调整后续计划。' },
      ],
      practicalTitle: '欢迎亲自到访',
      practicalBody: 'Thrive 是位于曼谷 The Crystal Park 的实体诊所，每天 10:00–19:00 营业。如需中文沟通，请提前通过电话或 LINE 联系团队，确认合适的到访时间。',
      moreFaq: [
        { q: '谁负责诊所的医疗工作？', a: 'Chanakan Trangansri 医生（Dr. Noon）担任医疗总监。泰文“关于我们”页面也展示了她的资料和照片。' },
        { q: '每个人的方案都一样吗？', a: '团队会先了解您的病史、检查结果和目标，再讨论下一步，而非为每位访客使用同一个固定方案。' },
      ],
    },
    contact: {
      heroPhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 的接待台', caption: '诊所位于 The Crystal Park B 栋二楼' },
      placePhoto: { src: '/thrive-clinic-home.jpg', alt: 'Thrive Wellness Clinic 内的等候区', caption: '预约到访前，先看看诊所内部空间' },
      audienceTitle: '选择方便的联系方式',
      audienceIntro: '您可以询问服务、查看可预约时间，或告诉我们正在考虑的项目。',
      audience: ['营业时间致电 095-934-9640', '通过 LINE @thrivewellnessth 发送信息', '填写下方预约表单并留下联系电话'],
      journeyTitle: '联系后会发生什么？',
      journeyIntro: '团队可协助您准备到访，无需先决定接受哪项治疗。',
      steps: [
        { title: '发送咨询', detail: '说明感兴趣的服务、主要顾虑及方便联系的方式。' },
        { title: '确认安排', detail: '与团队确认可预约时间、预约类型及需要携带的资料。' },
        { title: '前往 The Crystal Park', detail: '诊所位于 Pradit Manutham Road 199 号 B 栋二楼。' },
      ],
      practicalTitle: '到访信息',
      practicalBody: '诊所每天 10:00–19:00 营业，The Crystal Park 设有停车场。如需中文沟通，请提前提交预约申请。团队会确认可预约时间、语言支持、服务供应情况和准备事项。',
      moreFaq: [
        { q: '咨询时需要带什么？', a: '如有近期检查结果、药物清单或想问医生的问题，可一并带来。预约时请与团队确认所选服务的具体准备要求。' },
        { q: '预约前可以先问价格吗？', a: '可以。请说明您考虑的服务，团队可在您确认预约前解释当前价格和包含内容。' },
      ],
    },
    'iv-drip': {
      heroPhoto: { src: '/iv-drip-hero.jpg', alt: 'Thrive Wellness Clinic 的静脉营养疗程座椅', caption: 'Thrive Wellness Clinic 的静脉营养服务空间' },
      placePhoto: { src: '/iv-drip-customer-03.webp', alt: '诊所工作人员在静脉营养疗程中照护访客', caption: 'Thrive 泰文静脉营养页面使用的服务现场照片' },
      audienceTitle: '静脉营养疗程前值得讨论的问题',
      audienceIntro: '静脉输注属于医疗操作，应先了解病史以及您考虑疗程的原因。',
      audience: ['您的目标是什么？是否有其他更适合的方法？', '是否有肾脏、心脏或体液平衡方面的问题？', '建议方案包含哪些成分、剂量、时长及费用？'],
      journeyTitle: '一次预约可能包括什么？',
      journeyIntro: '医疗人员会确认具体方案，并评估静脉输注是否适合您。',
      steps: [
        { title: '讨论健康状况', detail: '说明现有疾病、药物、过敏史和期望达到的目标。' },
        { title: '了解建议方案', detail: '询问配方成分、建议原因及其他选择。' },
        { title: '接受疗程', detail: '团队说明操作并在输注过程中照护您。所需时间因配方而异。' },
        { title: '了解后续注意事项', detail: '离开前询问疗程后注意事项及出现不适时的联系方式。' },
      ],
      practicalTitle: '看看服务空间',
      practicalBody: '照片展示的是 Thrive 泰文服务页面使用的静脉营养空间。方案供应、成分和时长可能变化，请在预约前向诊所确认。',
      moreFaq: [
        { q: '一次疗程需要多久？', a: '时间取决于所选配方。确认方案时，请向团队询问预计时长。' },
        { q: '所有人都适合静脉营养疗程吗？', a: '不是。医疗人员应先了解病史、药物及体液平衡相关风险，再考虑是否建议静脉输注。' },
      ],
    },
    'check-up': {
      heroPhoto: { src: '/check-up-hero.jpg', alt: 'Thrive Wellness Clinic 的独立咨询和检查室', caption: 'Thrive Wellness Clinic 的咨询室' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 的接待处', caption: '诊所接待区，您的到访从这里开始' },
      audienceTitle: '带着问题选择检查',
      audienceIntro: '有用的健康检查从您想了解的问题开始。团队可协助缩小项目范围。',
      audience: ['评估目前的健康顾虑或家族病史', '了解激素、营养或其他专项检测是否相关', '与医疗人员讨论结果，而不只是独自查看数字'],
      journeyTitle: '从咨询到结果解读',
      journeyIntro: '检测内容、准备要求和所需时间因项目而异，预约前可先确认。',
      steps: [
        { title: '说明目标', detail: '告诉团队症状、过往结果、正在使用的药物及希望了解的问题。' },
        { title: '选择评估', detail: '团队解释相关项目、包含的检测和准备事项。' },
        { title: '完成检测', detail: '按项目要求到诊所采样或接受评估。' },
        { title: '解读结果', detail: '与医疗人员讨论结果、其局限及后续建议。' },
      ],
      practicalTitle: '预约前请确认',
      practicalBody: '请确认包含哪些检测、是否需要空腹或其他准备、何时可取得结果，以及是否包含结果咨询。不同检查项目的安排可能不同。',
      moreFaq: [
        { q: '检查前需要空腹吗？', a: '这取决于所选项目的检测内容。请在预约前向诊所确认准备要求。' },
        { q: '会有人解释检查结果吗？', a: '泰文健康检查页面介绍了由医疗人员解读结果的服务。请确认您所选项目的咨询形式。' },
      ],
    },
    hbot: {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'The Crystal Park 的 Thrive Wellness Clinic 内部', caption: '欢迎到曼谷的 Thrive 实体诊所参观' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 接待区', caption: '位于 The Crystal Park 的诊所接待处' },
      audienceTitle: '考虑 HBOT 前',
      audienceIntro: '高压氧属于加压疗程，先与团队沟通有助于判断是否适合您的情况。',
      audience: ['您为何考虑 HBOT？', '是否有耳部、鼻窦、肺部或其他需要说明的健康问题？', '计划的疗程时间、压力和次数分别是什么？'],
      journeyTitle: '疗程前后会发生什么？',
      journeyIntro: '开始前，团队应解释设备和操作流程。',
      steps: [
        { title: '讨论适用性', detail: '说明病史、当前症状和疗程目标。' },
        { title: '了解疗程计划', detail: '询问舱体、压力变化、单次时长及可能的不适。' },
        { title: '遵循指导', detail: '压力变化期间遵循团队指示；如有不适，请立即告知。' },
        { title: '讨论下一步', detail: '询问疗程后的注意事项及是否适合继续。' },
      ],
      practicalTitle: '先看诊所，再了解 HBOT 设备',
      practicalBody: '本页照片展示的是诊所空间，并未展示高压氧舱。预约前可联系团队确认目前使用的设备，或安排亲自查看疗程环境。',
      moreFaq: [
        { q: 'HBOT 可以替代其他医疗照护吗？', a: '不能。在考虑 HBOT 前，请与合格医疗人员讨论您的情况和现有治疗。' },
        { q: '这些照片中有高压氧舱吗？', a: '没有。本页使用的是诊所照片。您可以向团队索取当前设备照片，或亲自查看。' },
      ],
    },
    'mental-health': {
      heroPhoto: { src: '/thrive-clinic-home.jpg', alt: 'Thrive Wellness Clinic 内安静的等候空间', caption: 'Thrive Wellness Clinic 的室内空间' },
      placePhoto: { src: '/about-clinic.jpg', alt: 'Thrive Wellness Clinic 接待台', caption: '位于 The Crystal Park 的诊所接待处' },
      audienceTitle: '可以先从一次对话开始',
      audienceIntro: '咨询支持不要求您先有诊断结果。您可以告诉团队最近遇到的困难。',
      audience: ['压力或倦怠开始影响工作与生活', '希望讨论睡眠、情绪或持续的担忧', '想了解治疗师咨询及其他支持方式'],
      journeyTitle: '如何开始？',
      journeyIntro: '第一步是了解适合您需要的预约形式和专业人员。',
      steps: [
        { title: '联系我们', detail: '通过表单、电话或 LINE 询问治疗师可预约时间。' },
        { title: '确认形式', detail: '询问将与谁见面、咨询形式、时长及当前费用。' },
        { title: '私密交谈', detail: '讨论您的顾虑、目标和希望获得的支持。' },
        { title: '规划下一步', detail: '专业人员可讨论是否需要后续咨询或其他照护。' },
      ],
      practicalTitle: '明确服务范围',
      practicalBody: '治疗师咨询适用于预约安排的非紧急支持，不能替代紧急救助或专科精神医疗。如有迫切的人身安全风险，请立即寻求当地紧急援助，不要等待表单回复。',
      moreFaq: [
        { q: '还不清楚自己遇到什么问题，可以预约吗？', a: '可以。您可以描述目前的感受，并询问团队哪种预约可能适合。' },
        { q: '治疗师和精神科医生一样吗？', a: '两者职责不同。精神科医生是可诊断并开药的医生。预约前请向诊所确认接待您的专业人员及咨询内容。' },
      ],
    },
  },
};
