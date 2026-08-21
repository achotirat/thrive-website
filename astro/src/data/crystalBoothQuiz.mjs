const boothCta = { label: 'ฝากเบอร์รับของรางวัล', href: '#quiz-lead-form' };

const topConcernQuestion = {
  id: 'top-concern',
  text: 'ตอนนี้อะไรกวนใจคุณมากที่สุด?',
  helper: 'เลือกข้อที่ตรงกับคุณที่สุด',
  answers: [
    { id: 'hormone', label: 'ฮอร์โมนแปรปรวน รอบเดือนไม่ปกติ หรือสงสัยวัยทอง', nextQuestionId: 'hormone-cycle' },
    { id: 'metabolism', label: 'เผาผลาญพัง น้ำหนักขึ้นง่าย ลดยาก', nextQuestionId: 'metabolism-weight' },
    { id: 'liver', label: 'กังวลเรื่องตับ เหนื่อยง่าย ดื่ม/ใช้ยาบ่อย', nextQuestionId: 'liver-alcohol' },
    { id: 'skin', label: 'ผิวแห้ง คัน หรือมีผื่นแพ้', nextQuestionId: 'skin-dryness' },
    { id: 'vitamin', label: 'สงสัยว่าขาดวิตามินหรือแร่ธาตุ', nextQuestionId: 'vitamin-fatigue' },
    { id: 'stress', label: 'เครียดสะสม นอนไม่หลับ', nextQuestionId: 'stress-wake' },
  ],
};

const hormoneQuestions = [
  {
    id: 'hormone-cycle',
    text: 'รอบเดือนช่วง 2-4 สัปดาห์ที่ผ่านมาเป็นอย่างไร?',
    helper: 'ถ้าหมดประจำเดือนแล้วหรือไม่มีรอบเดือน ให้เลือกข้อสุดท้าย',
    answers: [
      { id: 'regular', label: 'มาสม่ำเสมอตามปกติ', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'irregular', label: 'เริ่มมาไม่สม่ำเสมอ ห่างขึ้นหรือถี่ขึ้น', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'menopause', label: 'ขาดหรือหมดไปแล้ว หรือมีอาการก่อนวัยทองชัดเจน', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-hotflash' },
    ],
  },
  {
    id: 'hormone-hotflash',
    text: 'มีอาการร้อนวูบวาบ เหงื่อออกกลางคืน หรือใจสั่นไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-mood' },
      { id: 'occasional', label: 'มีบ้างเป็นครั้งคราว', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-mood' },
      { id: 'frequent', label: 'มีบ่อยจนรบกวนการนอนหรือชีวิตประจำวัน', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-mood' },
    ],
  },
  {
    id: 'hormone-mood',
    text: 'อารมณ์ช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'stable', label: 'ค่อนข้างคงที่', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-skin' },
      { id: 'pms', label: 'หงุดหงิดง่ายขึ้น หรือมี PMS ชัดก่อนมีประจำเดือน', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-skin' },
      { id: 'volatile', label: 'อารมณ์แปรปรวนมาก ควบคุมยาก', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-skin' },
    ],
  },
  {
    id: 'hormone-skin',
    text: 'ผิวหรือผมช่วงนี้เปลี่ยนไปไหม?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-energy' },
      { id: 'mild-change', label: 'ผิวแห้งขึ้นหรือผมร่วงเล็กน้อย', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-energy' },
      { id: 'clear-change', label: 'ผิวหมองคล้ำ ผมร่วงเยอะ หรือสิวฮอร์โมนเป็นรอบ', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-energy' },
    ],
  },
  {
    id: 'hormone-energy',
    text: 'พลังงานระหว่างวันเป็นแบบไหน?',
    answers: [
      { id: 'steady', label: 'ค่อนข้างคงที่', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-weight' },
      { id: 'afternoon-crash', label: 'บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-weight' },
      { id: 'always-tired', label: 'เหนื่อยตลอดวันทั้งที่นอนพอ', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-weight' },
    ],
  },
  {
    id: 'hormone-weight',
    text: 'น้ำหนักหรือรอบเอวช่วงนี้เปลี่ยนไปไหม ทั้งที่กินไม่ต่างจากเดิม?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-sleep' },
      { id: 'slight-gain', label: 'ขึ้นเล็กน้อย โดยเฉพาะรอบเอว', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-sleep' },
      { id: 'clear-gain', label: 'ขึ้นชัดเจน ลดยากกว่าเดิมมาก', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-sleep' },
    ],
  },
  {
    id: 'hormone-sleep',
    text: 'การนอนหลับช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'rested', label: 'หลับสนิท ตื่นมาสดชื่น', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-impact' },
      { id: 'harder', label: 'หลับยากขึ้นหรือตื่นกลางดึกบ้าง', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-impact' },
      { id: 'disrupted', label: 'หลับไม่ลึก ตื่นบ่อย หรือบางคืนไม่หลับเลย', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-impact' },
    ],
  },
  {
    id: 'hormone-impact',
    text: 'อาการเหล่านี้กระทบชีวิตประจำวันแค่ไหน?',
    answers: [
      { id: 'low', label: 'ไม่ค่อยกระทบ', scores: { scoreHormone: 0 } },
      { id: 'some', label: 'กระทบบ้างแต่ยังจัดการได้', scores: { scoreHormone: 1 } },
      { id: 'high', label: 'กระทบชัดเจน ทั้งงาน อารมณ์ หรือความสัมพันธ์', scores: { scoreHormone: 3 } },
    ],
  },
];

const hormoneResults = [
  {
    id: 'hormone-high',
    title: 'สัญญาณฮอร์โมน/วัยทองค่อนข้างชัดเจน',
    summary: 'คำตอบของคุณชี้ไปทางฮอร์โมนที่อาจไม่สมดุลค่อนข้างชัด ทั้งฮอร์โมนเพศและสัญญาณวัยทอง ควรให้แพทย์ประเมินเพิ่มเติม',
    threshold: { scoreHormone: 10 },
    nurtureSegment: 'booth-hormone-high',
    recommendedSteps: [
      'จดอาการและรอบเดือน (ถ้ามี) ไว้เล่าให้แพทย์ฟัง',
      'ปรึกษาทีมแพทย์เรื่องการตรวจฮอร์โมนเพศและฮอร์โมนวัยทอง',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
  {
    id: 'hormone-moderate',
    title: 'เริ่มมีสัญญาณฮอร์โมนไม่สมดุล',
    summary: 'บางคำตอบของคุณสอดคล้องกับภาวะฮอร์โมนไม่สมดุล การตรวจเพิ่มเติมจะช่วยให้รู้แน่ชัดและวางแผนดูแลได้ตรงจุด',
    threshold: { scoreHormone: 5 },
    nurtureSegment: 'booth-hormone-moderate',
    recommendedSteps: [
      'สังเกตอาการต่อเนื่องอีก 1-2 สัปดาห์',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
  {
    id: 'hormone-early',
    title: 'ภาพรวมยังค่อนข้างสมดุล แต่ควรติดตามสัญญาณเล็ก ๆ',
    summary: 'คำตอบยังไม่ชี้ไปที่กลุ่มอาการเด่นชัด เหมาะกับการดูแลพื้นฐานและติดตามอาการเมื่อเริ่มรบกวนชีวิตประจำวัน',
    threshold: {},
    nurtureSegment: 'booth-hormone-early',
    recommendedSteps: [
      'ดูแล sleep routine และโปรตีนในแต่ละมื้อ',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

export const crystalBoothQuiz = {
  id: 'crystal-booth-checkup',
  serviceSlug: 'crystal-quiz',
  title: 'เช็กสุขภาพเบื้องต้น',
  eyebrow: 'Crystal Park Booth Check',
  intro: 'ตอบคำถามสั้น ๆ เพื่อดูว่าตอนนี้ร่างกายคุณส่งสัญญาณอะไร แล้วฝากเบอร์ติดต่อรับของรางวัลที่บูธได้เลย',
  startQuestionId: 'top-concern',
  leadFormTitle: 'ฝากเบอร์ติดต่อ รับของรางวัลที่บูธได้เลย',
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
  ],
  results: [
    ...hormoneResults,
  ],
};
