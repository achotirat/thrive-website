const resultCta = { label: 'ส่งผลให้ทีม Thrive ช่วยดู', href: '#quiz-lead-form' };

export const hormoneBalanceQuiz = {
  id: 'hormone-balance',
  serviceSlug: 'hormones-quiz',
  title: 'เช็กสมดุลฮอร์โมน',
  eyebrow: '2-minute hormone quiz',
  intro: 'ตอบคำถามสั้น ๆ เพื่อดูว่ากลุ่มอาการของคุณใกล้กับความเครียดสะสม พลังงานตก หรือฮอร์โมนเพศไม่สมดุลมากที่สุด',
  startQuestionId: 'sleep',
  leadFormTitle: 'ส่งผลแบบทดสอบให้ทีมแพทย์ช่วยดูต่อ',
  questions: [
    {
      id: 'sleep',
      text: 'ช่วง 2 สัปดาห์ที่ผ่านมา การนอนของคุณเป็นอย่างไร?',
      helper: 'เลือกข้อที่ใกล้เคียงที่สุด',
      answers: [
        { id: 'rested', label: 'หลับค่อนข้างดี ตื่นมาไม่เพลียมาก', scores: { balanced: 2 }, nextQuestionId: 'energy' },
        { id: 'wired', label: 'หลับยาก ตื่นกลางดึก หรือสมองไม่ยอมหยุดคิด', scores: { cortisol: 3 }, nextQuestionId: 'stress' },
        { id: 'hot-flash', label: 'หลับไม่ลึก มีร้อนวูบวาบ เหงื่อกลางคืน หรือรอบเดือนเปลี่ยน', scores: { sexHormone: 3 }, nextQuestionId: 'cycle' },
      ],
    },
    {
      id: 'energy',
      text: 'พลังงานระหว่างวันเป็นแบบไหน?',
      answers: [
        { id: 'steady', label: 'ค่อนข้างคงที่ ทำงานได้ตามปกติ', scores: { balanced: 2 }, nextQuestionId: 'weight' },
        { id: 'afternoon-crash', label: 'บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ/ของหวาน', scores: { thyroid: 3, cortisol: 1 }, nextQuestionId: 'weight' },
        { id: 'wake-tired', label: 'ตื่นมาก็เหนื่อยเหมือนไม่ได้พัก', scores: { thyroid: 2, cortisol: 2 }, nextQuestionId: 'stress' },
      ],
    },
    {
      id: 'stress',
      text: 'ร่างกายตอบสนองต่อความเครียดอย่างไร?',
      answers: [
        { id: 'high-alert', label: 'เครียดง่าย ใจสั่น หงุดหงิด หรือเหมือนร่างกายตื่นตัวตลอด', scores: { cortisol: 4 }, nextQuestionId: 'weight' },
        { id: 'flat', label: 'เครียดจนเฉย ๆ ไม่มีแรง ไม่มี motivation', scores: { cortisol: 2, thyroid: 2 }, nextQuestionId: 'weight' },
        { id: 'manageable', label: 'มีเครียดบ้าง แต่พักแล้วดีขึ้น', scores: { balanced: 1, cortisol: 1 }, nextQuestionId: 'weight' },
      ],
    },
    {
      id: 'cycle',
      text: 'มีอาการเกี่ยวกับรอบเดือน ผิว หรืออารมณ์แปรปรวนไหม?',
      answers: [
        { id: 'pms', label: 'มี PMS ชัด เจ็บคัดเต้านม สิว หรืออารมณ์เหวี่ยงก่อนมีประจำเดือน', scores: { sexHormone: 4 }, nextQuestionId: 'weight' },
        { id: 'irregular', label: 'รอบเดือนเริ่มไม่สม่ำเสมอ หรือมีสัญญาณวัยทอง/ก่อนวัยทอง', scores: { sexHormone: 4 }, nextQuestionId: 'weight' },
        { id: 'not-relevant', label: 'ไม่ค่อยเกี่ยว หรือไม่แน่ใจ', scores: { balanced: 1 }, nextQuestionId: 'weight' },
      ],
    },
    {
      id: 'weight',
      text: 'น้ำหนัก รูปร่าง หรือระบบเผาผลาญช่วงนี้เป็นอย่างไร?',
      answers: [
        { id: 'stable', label: 'ค่อนข้างคงที่', scores: { balanced: 1 } },
        { id: 'gain', label: 'น้ำหนักขึ้นง่าย โดยเฉพาะรอบเอว แม้กินไม่ต่างจากเดิม', scores: { thyroid: 3, sexHormone: 1 } },
        { id: 'craving', label: 'อยากหวาน/แป้งบ่อย หิวแกว่ง หรือพลังงานขึ้นลง', scores: { cortisol: 2, thyroid: 2 } },
      ],
    },
  ],
  results: [
    {
      id: 'cortisol',
      title: 'มีสัญญาณเครียดสะสม / Cortisol rhythm แกว่ง',
      summary: 'คำตอบของคุณชี้ไปทางระบบความเครียดและการนอนที่อาจรบกวนสมดุลฮอร์โมนโดยรวม เหมาะกับการประเมิน Cortisol, DHEA และปัจจัยการนอนร่วมกัน',
      threshold: { cortisol: 6 },
      nurtureSegment: 'hormone-cortisol',
      recommendedSteps: ['บันทึกเวลานอน-ตื่นและช่วงที่พลังงานตก 3 วัน', 'ปรึกษาแพทย์เพื่อเลือกชุดตรวจที่เหมาะกับอาการ', 'หลีกเลี่ยงการสรุปผลเองจากแบบทดสอบ'],
      cta: resultCta,
    },
    {
      id: 'thyroid',
      title: 'มีสัญญาณพลังงานตก / Metabolism และ Thyroid ควรดูเพิ่ม',
      summary: 'คำตอบเกี่ยวกับความเพลีย น้ำหนัก และพลังงานระหว่างวัน อาจสัมพันธ์กับ thyroid, insulin หรือสารอาหารที่เกี่ยวข้องกับระบบเผาผลาญ',
      threshold: { thyroid: 5 },
      nurtureSegment: 'hormone-energy',
      recommendedSteps: ['เตรียมข้อมูลน้ำหนัก รอบเอว และพฤติกรรมการกินช่วง 1 เดือน', 'ถามแพทย์เรื่อง thyroid และ metabolic markers', 'ถ้ามีอาการผิดปกติรุนแรงควรพบแพทย์โดยตรง'],
      cta: resultCta,
    },
    {
      id: 'sex-hormone',
      title: 'มีสัญญาณฮอร์โมนเพศไม่สมดุล',
      summary: 'รูปแบบคำตอบชี้ไปทาง Estrogen, Progesterone หรือ Testosterone ที่อาจเกี่ยวกับรอบเดือน ผิว อารมณ์ การนอน หรืออาการก่อน/ใกล้วัยทอง',
      threshold: { sexHormone: 5 },
      nurtureSegment: 'hormone-sex-hormone',
      recommendedSteps: ['จดรอบเดือนและอาการ PMS อย่างน้อย 1 รอบ', 'ปรึกษาแพทย์เรื่อง timing ของการตรวจ', 'แจ้งยาคุม อาหารเสริม หรือฮอร์โมนที่ใช้อยู่'],
      cta: resultCta,
    },
    {
      id: 'balanced',
      title: 'ภาพรวมยังค่อนข้างสมดุล แต่ควรติดตามสัญญาณเล็ก ๆ',
      summary: 'คำตอบยังไม่ชี้ไปที่กลุ่มอาการเด่นชัด เหมาะกับการดูแลพื้นฐานและตรวจเช็กเมื่ออาการเริ่มรบกวนชีวิตประจำวัน',
      threshold: { balanced: 3 },
      nurtureSegment: 'hormone-foundation',
      recommendedSteps: ['ดูแล sleep routine และโปรตีนในแต่ละมื้อ', 'ทำแบบทดสอบซ้ำเมื่ออาการเปลี่ยน', 'นัดปรึกษาได้ถ้าต้องการวางแผนตรวจเชิงป้องกัน'],
      cta: resultCta,
    },
  ],
};

export const mentalHealthQuiz = {
  id: 'therapist-fit',
  serviceSlug: 'mental-health',
  title: 'เช็กว่าควรเริ่มคุยกับนักบำบัดแบบไหน',
  eyebrow: 'Therapist Fit Quiz',
  intro: 'ตอบคำถามสั้น ๆ เพื่อดูว่าตอนนี้คุณเหมาะกับการเริ่มคุยเรื่องความเครียด การนอน อารมณ์แกว่ง หรือ Bach Flower support มากที่สุด',
  startQuestionId: 'main-pattern',
  leadFormTitle: 'ส่งผลแบบทดสอบให้ทีม Mental Health ช่วยดูต่อ',
  questions: [
    {
      id: 'main-pattern',
      text: 'อาการไหนรบกวนชีวิตคุณมากที่สุดตอนนี้?',
      answers: [
        { id: 'mood', label: 'อารมณ์แกว่ง หงุดหงิดง่าย ร้องไห้ง่าย หรือควบคุมอารมณ์ยาก', scores: { mood: 3, therapist: 2 }, nextQuestionId: 'frequency' },
        { id: 'stress', label: 'เครียด คิดวน วิตกกังวล หรือรู้สึกแบกอะไรไว้คนเดียว', scores: { stress: 3, therapist: 2 }, nextQuestionId: 'frequency' },
        { id: 'sleep', label: 'นอนไม่หลับ หลับไม่ลึก ตื่นกลางดึก หรือสมองไม่หยุดคิด', scores: { sleep: 3, therapist: 1 }, nextQuestionId: 'frequency' },
      ],
    },
    {
      id: 'frequency',
      text: 'อาการเกิดบ่อยแค่ไหน?',
      answers: [
        { id: 'sometimes', label: 'เป็นบางวัน แต่ยังจัดการได้', scores: { urgency: 1 }, nextQuestionId: 'duration' },
        { id: 'weekly', label: 'เป็นหลายวันต่อสัปดาห์ เริ่มกระทบงาน/ความสัมพันธ์', scores: { urgency: 3, intent: 1 }, nextQuestionId: 'duration' },
        { id: 'daily', label: 'แทบทุกวัน และเริ่มรู้สึกว่าควบคุมเองยาก', scores: { urgency: 5, intent: 2 }, nextQuestionId: 'duration' },
      ],
    },
    {
      id: 'duration',
      text: 'อาการต่อเนื่องมานานแค่ไหน?',
      answers: [
        { id: 'short', label: 'น้อยกว่า 2 สัปดาห์', scores: { urgency: 1 }, nextQuestionId: 'tried' },
        { id: 'month', label: 'ประมาณ 1-3 เดือน', scores: { urgency: 3, fit: 1 }, nextQuestionId: 'tried' },
        { id: 'long', label: 'มากกว่า 3 เดือนหรือเป็น ๆ หาย ๆ มานาน', scores: { urgency: 4, fit: 2 }, nextQuestionId: 'tried' },
      ],
    },
    {
      id: 'tried',
      text: 'คุณอยากได้ความช่วยเหลือแบบไหนมากที่สุด?',
      answers: [
        { id: 'talk', label: 'อยากมีคนฟังและช่วยจัดความคิดอย่างเป็นระบบ', scores: { intent: 5, therapist: 3 } },
        { id: 'bach', label: 'สนใจ Bach Flower หรือการปรับสมดุลอารมณ์แบบอ่อนโยน', scores: { bachFlower: 4, intent: 3 } },
        { id: 'body', label: 'อยากดูทั้งใจและร่างกาย เช่น ฮอร์โมน ลำไส้ หรือสารอาหารร่วมด้วย', scores: { integrative: 4, intent: 3 } },
      ],
    },
  ],
  results: [
    {
      id: 'therapist',
      title: 'เหมาะกับการเริ่มคุยกับนักบำบัด',
      summary: 'คำตอบของคุณสะท้อนว่าการมีพื้นที่ปลอดภัยให้เล่า ฟัง และจัดความคิดร่วมกับนักบำบัดอาจเป็นจุดเริ่มต้นที่เหมาะที่สุด',
      threshold: { therapist: 5 },
      nurtureSegment: 'mental-therapist-consult',
      recommendedSteps: ['เลือกช่วงเวลาที่สะดวกให้ทีมติดต่อกลับ', 'จดประเด็นที่อยากคุย 3 ข้อก่อนนัด', 'ถ้ามีความคิดทำร้ายตัวเองหรือคนอื่น ให้ติดต่อฉุกเฉินทันที'],
      cta: resultCta,
    },
    {
      id: 'stress',
      title: 'เหมาะกับ Stress regulation session',
      summary: 'คำตอบสะท้อนความเครียดสะสม คิดวน หรือความกังวลที่เริ่มกินพื้นที่ชีวิต การคุยกับนักบำบัดจะช่วยแยก trigger และวางวิธีรับมือที่ใช้ได้จริง',
      threshold: { stress: 3 },
      nurtureSegment: 'mental-anxiety-stress',
      recommendedSteps: ['สังเกตช่วงเวลาที่คิดวนหรือกังวลมากที่สุด', 'เตรียมข้อมูลเรื่องงาน ความสัมพันธ์ และการนอน', 'คุยกับทีมเพื่อเลือก therapist consult หรือ integrative consult'],
      cta: resultCta,
    },
    {
      id: 'mood',
      title: 'เหมาะกับ Mood swing support',
      summary: 'อารมณ์แกว่งไม่จำเป็นต้องรอให้รุนแรงก่อนคุยกับผู้เชี่ยวชาญ นักบำบัดจะช่วยดู pattern อารมณ์ trigger และวิธีดูแลใจระหว่างวัน',
      threshold: { mood: 3 },
      nurtureSegment: 'mental-mood-swings',
      recommendedSteps: ['จดอารมณ์ขึ้นลงและเหตุการณ์ก่อนหน้า 3 วัน', 'สังเกตความสัมพันธ์กับการนอน รอบเดือน คาเฟอีน หรือความเครียด', 'นัดคุยเพื่อวางแผน support ที่เหมาะกับคุณ'],
      cta: resultCta,
    },
    {
      id: 'bach-flower',
      title: 'อาจเหมาะกับ Bach Flower support ร่วมกับการคุย',
      summary: 'คุณสนใจแนวทางอ่อนโยนเพื่อดูแลอารมณ์และความรู้สึก Bach Flower สามารถเป็นส่วนเสริมในการคุยกับนักบำบัด โดยควรประเมินความเหมาะสมรายบุคคล',
      threshold: { bachFlower: 4 },
      nurtureSegment: 'mental-bach-flower',
      recommendedSteps: ['เตรียมเล่าอารมณ์ที่เกิดซ้ำหรือสถานการณ์ที่กระทบใจ', 'แจ้งยา/การรักษาที่ใช้อยู่เพื่อความต่อเนื่อง', 'เริ่มจากการคุยเพื่อเลือกแนวทางที่เหมาะกับคุณ'],
      cta: resultCta,
    },
    {
      id: 'urgent',
      title: 'ควรให้ผู้เชี่ยวชาญช่วยประเมินเร็วขึ้น',
      summary: 'ระดับความถี่ ระยะเวลา หรือผลกระทบต่อชีวิตค่อนข้างชัด แบบทดสอบนี้ไม่ใช่การวินิจฉัย แต่ควรมีผู้เชี่ยวชาญช่วยประเมินอย่างเป็นระบบ',
      threshold: { urgency: 8 },
      nurtureSegment: 'mental-high-urgency',
      recommendedSteps: ['ติดต่อทีมผ่าน LINE หรือโทรเพื่อคัดกรองเบื้องต้น', 'ถ้ามีความคิดทำร้ายตัวเองหรือคนอื่น ให้โทร 1323 หรือฉุกเฉิน 1669 ทันที', 'เตรียมข้อมูลยา การรักษาเดิม หรือโรคประจำตัวก่อนปรึกษา'],
      cta: resultCta,
    },
  ],
};

export const ivDripQuiz = {
  id: 'iv-goal',
  serviceSlug: 'iv-drip',
  title: 'เลือกสูตร IV Drip ที่ใกล้เป้าหมายคุณ',
  eyebrow: 'IV Goal Quiz',
  intro: 'ตอบสั้น ๆ เพื่อดูว่าเป้าหมายของคุณใกล้กับผิว พลังงาน ภูมิคุ้มกัน หรือ recovery มากที่สุด',
  startQuestionId: 'goal',
  leadFormTitle: 'ส่งผล IV Goal Quiz ให้ทีมช่วยแนะนำสูตร',
  questions: [
    {
      id: 'goal',
      text: 'เป้าหมายหลักของคุณตอนนี้คืออะไร?',
      answers: [
        { id: 'skin', label: 'ผิวหมอง อยากดูสดใสจากภายใน', scores: { skin: 3, fit: 2 }, nextQuestionId: 'timeline' },
        { id: 'energy', label: 'อ่อนเพลีย ทำงานหนัก อยากเติมพลัง', scores: { energy: 3, fit: 2 }, nextQuestionId: 'timeline' },
        { id: 'immune', label: 'ป่วยง่าย พักผ่อนน้อย อยากเสริมภูมิคุ้มกัน', scores: { immune: 3, fit: 2 }, nextQuestionId: 'timeline' },
      ],
    },
    {
      id: 'timeline',
      text: 'อยากเห็นความเปลี่ยนแปลงเร็วแค่ไหน?',
      answers: [
        { id: 'event', label: 'มีงาน/ทริป/ถ่ายรูปใน 1-2 สัปดาห์', scores: { urgency: 4, intent: 2 }, nextQuestionId: 'history' },
        { id: 'month', label: 'อยากวางแผนดูแลต่อเนื่องในเดือนนี้', scores: { urgency: 2, intent: 2 }, nextQuestionId: 'history' },
        { id: 'curious', label: 'กำลังหาข้อมูล ยังไม่รีบ', scores: { intent: 1 }, nextQuestionId: 'history' },
      ],
    },
    {
      id: 'history',
      text: 'เคยทำ IV Drip มาก่อนไหม?',
      answers: [
        { id: 'never', label: 'ยังไม่เคย อยากเริ่มแบบปลอดภัย', scores: { fit: 1, intent: 1 } },
        { id: 'done', label: 'เคยทำแล้ว อยากหาโปรแกรมที่เหมาะขึ้น', scores: { fit: 2, intent: 3 } },
        { id: 'course', label: 'สนใจคอร์สต่อเนื่องถ้าสูตรเหมาะ', scores: { intent: 5, fit: 2 } },
      ],
    },
  ],
  results: [
    { id: 'skin', title: 'เหมาะกับ Skin Glow pathway', summary: 'เป้าหมายของคุณใกล้กับสูตรที่เน้นผิว ความสดใส และ antioxidant support แพทย์ควรประเมินประวัติสุขภาพก่อนเลือกสูตรจริง', threshold: { skin: 3 }, nurtureSegment: 'iv-skin-glow', recommendedSteps: ['แจ้งวันงานหรือ deadline', 'ถ่ายรูปสภาพผิวปัจจุบันไว้เทียบ', 'คุยกับทีมเพื่อเลือกสูตรและความถี่'], cta: resultCta },
    { id: 'energy', title: 'เหมาะกับ Energy recovery pathway', summary: 'คำตอบชี้ไปที่การเติมสารอาหารและ hydration เพื่อช่วย support พลังงานและการฟื้นตัว โดยควรดูสาเหตุความเพลียร่วมด้วย', threshold: { energy: 3 }, nurtureSegment: 'iv-fatigue', recommendedSteps: ['จดเวลานอนและกาแฟต่อวัน', 'แจ้งโรคประจำตัว/ยาที่ใช้', 'ปรึกษาเรื่องสูตร B complex, vitamin C หรือ NAD+ ตามความเหมาะสม'], cta: resultCta },
    { id: 'immune', title: 'เหมาะกับ Immune support pathway', summary: 'เป้าหมายของคุณใกล้กับสูตรเสริมภูมิคุ้มกันและ antioxidant support โดยต้องประเมินความเหมาะสมรายบุคคลก่อน', threshold: { immune: 3 }, nurtureSegment: 'iv-immune', recommendedSteps: ['แจ้งความถี่ป่วยและประวัติแพ้ยา', 'พิจารณาตรวจ vitamin D/zinc ถ้ามีอาการเรื้อรัง', 'ให้ทีมแพทย์ช่วยแนะนำสูตรเริ่มต้น'], cta: resultCta },
  ],
};

export const foodIntoleranceQuiz = {
  id: 'food-trigger',
  serviceSlug: 'food-intolerance',
  title: 'เช็กสัญญาณภูมิแพ้อาหารแฝง',
  eyebrow: 'Food Trigger Quiz',
  intro: 'ประเมินว่าอาการของคุณใกล้กับกลุ่มทางเดินอาหาร ผิว หรืออ่อนเพลียเรื้อรังที่ควรตรวจ IgG หรือไม่',
  startQuestionId: 'symptom',
  leadFormTitle: 'ส่งผล Food Trigger Quiz ให้ทีมช่วยดู',
  questions: [
    { id: 'symptom', text: 'อาการไหนเป็นบ่อยที่สุดหลังทานอาหารหรือในชีวิตประจำวัน?', answers: [
      { id: 'digestive', label: 'ท้องอืด ปวดท้อง ถ่ายผิดปกติ', scores: { digestive: 3, fit: 2 }, nextQuestionId: 'duration' },
      { id: 'skin', label: 'ผื่น สิว คัน หรือผิวอักเสบเป็น ๆ หาย ๆ', scores: { skin: 3, fit: 2 }, nextQuestionId: 'duration' },
      { id: 'fatigue', label: 'อ่อนเพลีย สมองล้า หรือบวมง่ายโดยหาสาเหตุไม่ได้', scores: { fatigue: 3, fit: 2 }, nextQuestionId: 'duration' },
    ] },
    { id: 'duration', text: 'เป็นต่อเนื่องมานานแค่ไหน?', answers: [
      { id: 'new', label: 'เพิ่งเริ่มเป็น', scores: { urgency: 1 }, nextQuestionId: 'tried' },
      { id: 'months', label: 'หลายเดือนและเริ่มรบกวนชีวิต', scores: { urgency: 3, intent: 2 }, nextQuestionId: 'tried' },
      { id: 'years', label: 'เป็น ๆ หาย ๆ มานาน ตรวจแล้วยังไม่เจอสาเหตุ', scores: { urgency: 4, intent: 3, fit: 2 }, nextQuestionId: 'tried' },
    ] },
    { id: 'tried', text: 'เคยลองงดอาหารหรือรักษาแล้วไหม?', answers: [
      { id: 'none', label: 'ยังไม่เคยลองจริงจัง', scores: { intent: 1 } },
      { id: 'avoid', label: 'เคยงดบางอย่างแล้วดีขึ้นบ้าง', scores: { fit: 3, intent: 3 } },
      { id: 'confused', label: 'ลองหลายอย่างแล้ว แต่ยังไม่รู้ตัวกระตุ้น', scores: { fit: 4, intent: 4 } },
    ] },
  ],
  results: [
    { id: 'digestive', title: 'สัญญาณเด่นทางระบบย่อยอาหาร', summary: 'คำตอบของคุณใกล้กับกลุ่มอาการท้องอืด ปวดท้อง หรือถ่ายผิดปกติที่อาจมีอาหารบางชนิดเป็นตัวกระตุ้น', threshold: { digestive: 3 }, nurtureSegment: 'food-intolerance-digestive', recommendedSteps: ['จดอาหารและอาการ 3 วัน', 'หลีกเลี่ยงการงดอาหารกว้างเกินไปเอง', 'ให้ทีมแพทย์ช่วยดูว่าควรตรวจ IgG หรือประเมินลำไส้ร่วมด้วย'], cta: resultCta },
    { id: 'skin', title: 'สัญญาณเด่นทางผิว', summary: 'ผื่น สิว หรือคันเรื้อรังบางเคสอาจสัมพันธ์กับอาหารและ gut inflammation ควรประเมินร่วมกับประวัติผิวและอาหาร', threshold: { skin: 3 }, nurtureSegment: 'food-intolerance-skin', recommendedSteps: ['ถ่ายรูปผื่น/สิวช่วง flare', 'จดอาหารที่กินก่อนอาการกำเริบ', 'ปรึกษาเพื่อวางแผนตรวจและ elimination อย่างปลอดภัย'], cta: resultCta },
    { id: 'fatigue', title: 'สัญญาณเด่นเรื่องอ่อนเพลีย/สมองล้า', summary: 'คำตอบชี้ไปที่กลุ่มอาการที่อาจเกี่ยวกับการอักเสบต่ำ ๆ หรืออาหารกระตุ้น แต่ควรแยกสาเหตุอื่นร่วมด้วย', threshold: { fatigue: 3 }, nurtureSegment: 'food-intolerance-fatigue', recommendedSteps: ['จดช่วงเวลาที่สมองล้าหลังอาหาร', 'เตรียมผลตรวจเดิมถ้ามี', 'ให้ทีมช่วยเลือกว่าจะเริ่มจาก IgG หรือ check-up อื่น'], cta: resultCta },
  ],
};

export const chelationQuiz = {
  id: 'toxic-load',
  serviceSlug: 'chelation',
  title: 'ประเมินความเสี่ยง Toxic Load เบื้องต้น',
  eyebrow: 'Toxic Load Assessment',
  intro: 'ดูว่าประวัติชีวิตและอาการของคุณควรเริ่มจากการตรวจโลหะหนักหรือปรึกษาเรื่อง Chelation หรือไม่',
  startQuestionId: 'exposure',
  leadFormTitle: 'ส่งผล Toxic Load Assessment ให้ทีมช่วยดู',
  questions: [
    { id: 'exposure', text: 'คุณมี exposure แบบไหนใกล้ตัวที่สุด?', answers: [
      { id: 'pollution', label: 'อยู่ในเมือง เจอฝุ่น PM2.5/ควัน/มลพิษบ่อย', scores: { toxicity: 3, fit: 2 }, nextQuestionId: 'symptom' },
      { id: 'dental', label: 'มีประวัติอุดฟันโลหะ งานอุตสาหกรรม หรือสัมผัสสารเคมี', scores: { toxicity: 4, fit: 3 }, nextQuestionId: 'symptom' },
      { id: 'prevention', label: 'อยากตรวจเชิงป้องกัน ยังไม่มี exposure ชัด', scores: { fit: 1, intent: 1 }, nextQuestionId: 'symptom' },
    ] },
    { id: 'symptom', text: 'มีอาการหรือความกังวลด้านใดมากที่สุด?', answers: [
      { id: 'vascular', label: 'กังวลหลอดเลือด ความดัน ไขมัน หรือหัวใจ', scores: { vascular: 3, urgency: 2 }, nextQuestionId: 'readiness' },
      { id: 'brainfog', label: 'สมองล้า ปวดหัว เหนื่อยง่าย หรือไม่สดชื่น', scores: { toxicity: 2, urgency: 2 }, nextQuestionId: 'readiness' },
      { id: 'general', label: 'อยากรู้ระดับโลหะหนักก่อนตัดสินใจ', scores: { intent: 2 }, nextQuestionId: 'readiness' },
    ] },
    { id: 'readiness', text: 'คุณพร้อมเริ่มจากขั้นตอนไหน?', answers: [
      { id: 'learn', label: 'อยากคุยให้เข้าใจก่อน', scores: { intent: 1 } },
      { id: 'test', label: 'พร้อมตรวจโลหะหนักก่อนวางแผน', scores: { intent: 4, fit: 2 } },
      { id: 'program', label: 'สนใจโปรแกรมถ้าแพทย์ประเมินว่าเหมาะ', scores: { intent: 5, fit: 3 } },
    ] },
  ],
  results: [
    { id: 'toxic-load', title: 'ควรเริ่มจาก Heavy metal screening', summary: 'คำตอบของคุณมี exposure หรืออาการที่ควรประเมินระดับโลหะหนักก่อนพิจารณา Chelation เพื่อให้วางแผนได้ปลอดภัย', threshold: { toxicity: 5 }, nurtureSegment: 'chelation-toxic-load', recommendedSteps: ['รวบรวมประวัติสัมผัสสารเคมี/โลหะ', 'สอบถามทีมเรื่องชุดตรวจโลหะหนัก', 'ไม่ควรเริ่ม Chelation โดยไม่ประเมินไตและสุขภาพรวม'], cta: resultCta },
    { id: 'vascular', title: 'ควรประเมินร่วมกับ cardiovascular risk', summary: 'ถ้ากังวลหลอดเลือดหรือหัวใจ ควรคุยกับแพทย์เรื่อง marker ที่เกี่ยวข้องก่อนเลือก protocol', threshold: { vascular: 3 }, nurtureSegment: 'chelation-vascular', recommendedSteps: ['เตรียมผลไขมัน ความดัน น้ำตาล ถ้ามี', 'ถามแพทย์เรื่องความเหมาะสมของ Chelation', 'วางแผนติดตามผลแบบวัดได้'], cta: resultCta },
    { id: 'prevention', title: 'เหมาะกับการปรึกษาเชิงป้องกัน', summary: 'ตอนนี้ยังไม่ชี้ความเร่งด่วนสูง แต่สามารถเริ่มจากการปรึกษาและตรวจ baseline เพื่อวางแผนป้องกันระยะยาว', threshold: { intent: 2 }, nurtureSegment: 'chelation-prevention', recommendedSteps: ['เริ่มจาก consult ฟรี', 'คุยเรื่อง exposure และเป้าหมายสุขภาพ', 'ตรวจเฉพาะรายการที่จำเป็น'], cta: resultCta },
  ],
};

export const hbotQuiz = {
  id: 'recovery-goal',
  serviceSlug: 'hbot',
  title: 'เช็กเป้าหมาย Recovery สำหรับ HBOT',
  eyebrow: 'Recovery Goal Quiz',
  intro: 'ดูว่าเป้าหมายของคุณใกล้กับ recovery, brain fog, performance หรือ longevity pathway',
  startQuestionId: 'goal',
  leadFormTitle: 'ส่งผล Recovery Goal Quiz ให้ทีมช่วยแนะนำจำนวนครั้ง',
  questions: [
    { id: 'goal', text: 'เป้าหมายหลักของคุณกับ HBOT คืออะไร?', answers: [
      { id: 'recovery', label: 'ฟื้นตัวหลังเจ็บ/ผ่าตัด/ออกกำลังหนัก', scores: { recovery: 3, fit: 2 }, nextQuestionId: 'timeline' },
      { id: 'brain', label: 'สมองล้า นอนไม่สดชื่น อยากรู้สึก clear ขึ้น', scores: { brain: 3, fit: 2 }, nextQuestionId: 'timeline' },
      { id: 'longevity', label: 'ดูแล anti-aging/longevity ต่อเนื่อง', scores: { longevity: 3, fit: 2 }, nextQuestionId: 'timeline' },
    ] },
    { id: 'timeline', text: 'ต้องการเห็นผลในกรอบเวลาไหน?', answers: [
      { id: 'soon', label: 'เร็วที่สุด เพราะมีอาการ/เป้าหมายชัด', scores: { urgency: 4, intent: 2 }, nextQuestionId: 'history' },
      { id: 'month', label: 'ภายในเดือนนี้', scores: { urgency: 2, intent: 2 }, nextQuestionId: 'history' },
      { id: 'explore', label: 'หาข้อมูลก่อน', scores: { intent: 1 }, nextQuestionId: 'history' },
    ] },
    { id: 'history', text: 'เคยทำ HBOT หรือ therapy ฟื้นฟูมาก่อนไหม?', answers: [
      { id: 'never', label: 'ยังไม่เคย อยากรู้ว่าเหมาะไหม', scores: { intent: 1 } },
      { id: 'tried', label: 'เคยทำบางอย่างแล้ว อยากเสริมให้ฟื้นดีขึ้น', scores: { intent: 3, fit: 2 } },
      { id: 'course', label: 'สนใจคอร์สถ้าแพทย์แนะนำจำนวนครั้งชัดเจน', scores: { intent: 5, fit: 2 } },
    ] },
  ],
  results: [
    { id: 'recovery', title: 'เหมาะกับ Recovery support pathway', summary: 'คำตอบของคุณเน้นการฟื้นตัว ร่างกายควรได้รับการประเมินเป้าหมายและข้อควรระวังก่อนกำหนดจำนวนครั้ง', threshold: { recovery: 3 }, nurtureSegment: 'hbot-recovery', recommendedSteps: ['แจ้งประวัติบาดเจ็บ/ผ่าตัด/ออกกำลัง', 'ให้ทีมประเมินความเหมาะสมและความถี่', 'พิจารณาทำร่วมกับ IV/NAD+ หากเหมาะ'], cta: resultCta },
    { id: 'brain', title: 'เหมาะกับ Brain fog / clarity pathway', summary: 'ถ้าเป้าหมายคือสมองใสและคุณภาพการนอน ควรประเมินร่วมกับ sleep, stress และ metabolic factors', threshold: { brain: 3 }, nurtureSegment: 'hbot-brain-fog', recommendedSteps: ['จดช่วงเวลาสมองล้าและการนอน', 'ถามแพทย์ว่าควรตรวจอะไรเพิ่มเติม', 'เริ่มจาก consult เพื่อดูข้อห้าม'], cta: resultCta },
    { id: 'longevity', title: 'เหมาะกับ Longevity maintenance pathway', summary: 'HBOT อาจเป็นส่วนหนึ่งของแผนดูแลระยะยาว แต่ควรวางร่วมกับ lifestyle, labs และบริการเสริมที่เหมาะกับร่างกายคุณ', threshold: { longevity: 3 }, nurtureSegment: 'hbot-longevity', recommendedSteps: ['ระบุเป้าหมายสุขภาพ 3 เดือน', 'คุยเรื่องความถี่แบบ maintenance', 'ประเมินร่วมกับ check-up หรือ NAD+ ถ้าเหมาะ'], cta: resultCta },
  ],
};

export const campaignQuizzes = {
  'food-intolerance': foodIntoleranceQuiz,
  'hormones-quiz': hormoneBalanceQuiz,
  'iv-drip': ivDripQuiz,
  chelation: chelationQuiz,
  hbot: hbotQuiz,
  'mental-health': mentalHealthQuiz,
};

export function getCampaignQuiz(serviceSlug) {
  return campaignQuizzes[serviceSlug];
}
