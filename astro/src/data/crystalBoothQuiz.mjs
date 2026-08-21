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
      { id: 'regular', label: 'มาสม่ำเสมอตามปกติ', scores: { scoreHormone: 0, enteredHormone: 1 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'irregular', label: 'เริ่มมาไม่สม่ำเสมอ ห่างขึ้นหรือถี่ขึ้น', scores: { scoreHormone: 2, enteredHormone: 1 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'menopause', label: 'ขาดหรือหมดไปแล้ว หรือมีอาการก่อนวัยทองชัดเจน', scores: { scoreHormone: 3, enteredHormone: 1 }, nextQuestionId: 'hormone-hotflash' },
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
    threshold: { enteredHormone: 1 },
    nurtureSegment: 'booth-hormone-early',
    recommendedSteps: [
      'ดูแล sleep routine และโปรตีนในแต่ละมื้อ',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

const metabolismQuestions = [
  {
    id: 'metabolism-weight',
    text: 'น้ำหนักช่วง 2-3 เดือนที่ผ่านมาเปลี่ยนไปอย่างไร ทั้งที่กินไม่ต่างจากเดิม?',
    answers: [
      { id: 'stable', label: 'ค่อนข้างคงที่', scores: { scoreMetabolism: 0, enteredMetabolism: 1 }, nextQuestionId: 'metabolism-waist' },
      { id: 'slight-gain', label: 'ขึ้นเล็กน้อย', scores: { scoreMetabolism: 1, enteredMetabolism: 1 }, nextQuestionId: 'metabolism-waist' },
      { id: 'stuck', label: 'ขึ้นชัดเจน หรือลดยากมากแม้พยายามคุมอาหาร/ออกกำลังกาย', scores: { scoreMetabolism: 3, enteredMetabolism: 1 }, nextQuestionId: 'metabolism-waist' },
    ],
  },
  {
    id: 'metabolism-waist',
    text: 'รอบเอวหรือไขมันหน้าท้องเป็นอย่างไร?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-cravings' },
      { id: 'slight', label: 'เพิ่มขึ้นเล็กน้อย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-cravings' },
      { id: 'clear', label: 'เพิ่มขึ้นชัดเจน ทั้งที่น้ำหนักตัวโดยรวมไม่ได้ขึ้นมาก', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-cravings' },
    ],
  },
  {
    id: 'metabolism-cravings',
    text: 'อยากของหวานหรือแป้งบ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'แทบไม่เลย', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-energy' },
      { id: 'some-days', label: 'บางวัน โดยเฉพาะตอนเครียดหรือบ่าย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-energy' },
      { id: 'daily', label: 'อยากเกือบทุกวัน หิวแกว่งจนหงุดหงิด', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-energy' },
    ],
  },
  {
    id: 'metabolism-energy',
    text: 'พลังงานระหว่างวันเป็นแบบไหน?',
    answers: [
      { id: 'steady', label: 'ค่อนข้างคงที่', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-effort' },
      { id: 'afternoon-crash', label: 'บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ/ของหวาน', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-effort' },
      { id: 'always-tired', label: 'เหนื่อยตลอดวันทั้งที่นอนพอ', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-effort' },
    ],
  },
  {
    id: 'metabolism-effort',
    text: 'ออกกำลังกายหรือคุมอาหารแล้วเห็นผลไหม?',
    answers: [
      { id: 'as-expected', label: 'เห็นผลตามที่ควรจะเป็น', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-digestion' },
      { id: 'slower', label: 'เห็นผลช้ากว่าที่เคย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-digestion' },
      { id: 'no-result', label: 'แทบไม่เห็นผลเลย ทั้งที่พยายามมาก', scores: { scoreMetabolism: 3 }, nextQuestionId: 'metabolism-digestion' },
    ],
  },
  {
    id: 'metabolism-digestion',
    text: 'มีอาการท้องอืด บวมง่าย หรือขับถ่ายผิดปกติร่วมด้วยไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-duration' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-duration' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-duration' },
    ],
  },
  {
    id: 'metabolism-duration',
    text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน', scores: { scoreMetabolism: 0 } },
      { id: 'months', label: '1-6 เดือน', scores: { scoreMetabolism: 1 } },
      { id: 'chronic', label: 'มากกว่า 6 เดือน หรือเรื้อรัง', scores: { scoreMetabolism: 2 } },
    ],
  },
];

const metabolismResults = [
  {
    id: 'metabolism-high',
    title: 'มีสัญญาณเผาผลาญ/น้ำหนักที่ควรตรวจเพิ่มเติม',
    summary: 'น้ำหนัก รอบเอว และพลังงานที่เปลี่ยนไปค่อนข้างชัด อาจเกี่ยวกับระบบเผาผลาญ ไทรอยด์ หรือน้ำตาลในเลือด ควรตรวจเช็กเพื่อหาสาเหตุที่แท้จริง',
    threshold: { scoreMetabolism: 8 },
    nurtureSegment: 'booth-metabolism-high',
    recommendedSteps: [
      'จดพฤติกรรมการกินและน้ำหนัก 2 สัปดาห์',
      'ปรึกษาทีมแพทย์เรื่องตรวจระบบเผาผลาญและไทรอยด์',
      'ไม่ควรลดน้ำหนักแบบหักโหมเองก่อนตรวจหาสาเหตุ',
    ],
    cta: boothCta,
  },
  {
    id: 'metabolism-moderate',
    title: 'เริ่มมีสัญญาณเผาผลาญเปลี่ยนแปลง',
    summary: 'บางคำตอบชี้ไปที่ระบบเผาผลาญที่เริ่มทำงานเปลี่ยนไป ควรสังเกตต่อเนื่องและปรึกษาแพทย์หากไม่ดีขึ้น',
    threshold: { scoreMetabolism: 4 },
    nurtureSegment: 'booth-metabolism-moderate',
    recommendedSteps: [
      'จดอาหารและน้ำหนักไว้เทียบ 1-2 สัปดาห์',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'ไม่ควรลดน้ำหนักแบบหักโหมเองก่อนตรวจหาสาเหตุ',
    ],
    cta: boothCta,
  },
  {
    id: 'metabolism-early',
    title: 'ภาพรวมเผาผลาญยังค่อนข้างปกติ',
    summary: 'คำตอบยังไม่ชี้ไปที่ความผิดปกติชัดเจน เหมาะกับการดูแลอาหารและการออกกำลังกายต่อเนื่อง',
    threshold: { enteredMetabolism: 1 },
    nurtureSegment: 'booth-metabolism-early',
    recommendedSteps: [
      'รักษาสมดุลอาหารและการออกกำลังกายต่อเนื่อง',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

const liverQuestions = [
  {
    id: 'liver-alcohol',
    text: 'คุณดื่มแอลกอฮอล์บ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'ไม่ดื่มเลยหรือดื่มน้อยมาก', scores: { scoreLiver: 0, enteredLiver: 1 }, nextQuestionId: 'liver-meds' },
      { id: 'occasional', label: 'ดื่มเป็นครั้งคราว (1-2 ครั้ง/สัปดาห์)', scores: { scoreLiver: 1, enteredLiver: 1 }, nextQuestionId: 'liver-meds' },
      { id: 'frequent', label: 'ดื่มบ่อย หรือดื่มปริมาณมากเมื่อดื่ม', scores: { scoreLiver: 3, enteredLiver: 1 }, nextQuestionId: 'liver-meds' },
    ],
  },
  {
    id: 'liver-meds',
    text: 'ใช้ยา อาหารเสริม หรือสมุนไพรต่อเนื่องเป็นประจำไหม?',
    answers: [
      { id: 'none', label: 'ไม่ได้ใช้', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-fatigue' },
      { id: 'occasional', label: 'ใช้บางตัวเป็นครั้งคราว', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-fatigue' },
      { id: 'regular', label: 'ใช้หลายอย่างต่อเนื่องเป็นประจำ', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-fatigue' },
    ],
  },
  {
    id: 'liver-fatigue',
    text: 'รู้สึกเหนื่อยง่าย อ่อนเพลียโดยไม่มีสาเหตุชัดเจนไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-skin' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-skin' },
      { id: 'frequent', label: 'มีบ่อย เพลียง่ายผิดปกติ', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-skin' },
    ],
  },
  {
    id: 'liver-skin',
    text: 'ผิวหน้ามันมาก สิวขึ้นง่าย หรือผิวคล้ำผิดปกติไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-labs' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-labs' },
      { id: 'clear', label: 'มีชัดเจน', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-labs' },
    ],
  },
  {
    id: 'liver-labs',
    text: 'เคยตรวจเลือดแล้วค่าตับ (SGOT/SGPT) สูงกว่าปกติไหม?',
    answers: [
      { id: 'never-or-normal', label: 'ไม่เคยตรวจ หรือตรวจแล้วปกติ', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-digestion' },
      { id: 'slightly-high', label: 'เคยสูงเล็กน้อย', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-digestion' },
      { id: 'clearly-high', label: 'เคยสูงชัดเจน หรือหมอแจ้งว่าต้องติดตาม', scores: { scoreLiver: 4 }, nextQuestionId: 'liver-digestion' },
    ],
  },
  {
    id: 'liver-digestion',
    text: 'มีอาการท้องอืด แน่นใต้ชายโครงขวา หรือเบื่ออาหารไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-weight' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-weight' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-weight' },
    ],
  },
  {
    id: 'liver-weight',
    text: 'น้ำหนักตัวตอนนี้เป็นอย่างไร?',
    answers: [
      { id: 'normal', label: 'อยู่ในเกณฑ์ปกติ', scores: { scoreLiver: 0 } },
      { id: 'slightly-over', label: 'เกินเกณฑ์เล็กน้อย', scores: { scoreLiver: 1 } },
      { id: 'well-over', label: 'เกินเกณฑ์ค่อนข้างมาก (เสี่ยงไขมันพอกตับ)', scores: { scoreLiver: 2 } },
    ],
  },
];

const liverResults = [
  {
    id: 'liver-high',
    title: 'มีสัญญาณที่ควรตรวจการทำงานของตับ',
    summary: 'พฤติกรรมและอาการของคุณค่อนข้างชัดว่าอาจส่งผลต่อตับ เช่น การดื่ม การใช้ยา/อาหารเสริมต่อเนื่อง หรือค่าตับที่เคยสูง ควรตรวจเพิ่มเติม',
    threshold: { scoreLiver: 9 },
    nurtureSegment: 'booth-liver-high',
    recommendedSteps: [
      'ตรวจการทำงานของตับ (Liver Function Test)',
      'ปรึกษาทีมแพทย์เรื่องกลูต้าไธโอนดริปเพื่อดีท็อกซ์ตับ',
      'ลดหรือเว้นแอลกอฮอล์ระหว่างรอผลตรวจ',
    ],
    cta: boothCta,
  },
  {
    id: 'liver-moderate',
    title: 'เริ่มมีปัจจัยเสี่ยงต่อตับที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ปัจจัยเสี่ยงต่อตับ เช่น การดื่มหรือการใช้ยาต่อเนื่อง ควรติดตามและตรวจเช็กเป็นระยะ',
    threshold: { scoreLiver: 4 },
    nurtureSegment: 'booth-liver-moderate',
    recommendedSteps: [
      'ลดความถี่การดื่มแอลกอฮอล์',
      'ปรึกษาทีมแพทย์ที่บูธเรื่องการตรวจตับเบื้องต้น',
      'สังเกตอาการเหนื่อยง่ายหรือท้องอืดต่อเนื่อง',
    ],
    cta: boothCta,
  },
  {
    id: 'liver-early',
    title: 'ภาพรวมตับยังไม่มีสัญญาณเสี่ยงชัดเจน',
    summary: 'คำตอบยังไม่ชี้ไปที่ปัจจัยเสี่ยงต่อตับ เหมาะกับการดูแลพื้นฐานต่อเนื่อง',
    threshold: { enteredLiver: 1 },
    nurtureSegment: 'booth-liver-early',
    recommendedSteps: [
      'ดูแลการดื่มแอลกอฮอล์และการใช้ยาให้อยู่ในปริมาณที่เหมาะสม',
      'ตรวจสุขภาพประจำปีตามปกติ',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

const skinQuestions = [
  {
    id: 'skin-dryness',
    text: 'ผิวคุณช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'normal', label: 'ปกติดี', scores: { scoreSkin: 0, enteredSkin: 1 }, nextQuestionId: 'skin-rash' },
      { id: 'drier', label: 'แห้งขึ้น ตึงบ่อย', scores: { scoreSkin: 1, enteredSkin: 1 }, nextQuestionId: 'skin-rash' },
      { id: 'very-dry', label: 'แห้งมาก ลอก หรือคันร่วมด้วย', scores: { scoreSkin: 2, enteredSkin: 1 }, nextQuestionId: 'skin-rash' },
    ],
  },
  {
    id: 'skin-rash',
    text: 'มีผื่นแดง คัน หรือลมพิษขึ้นบ่อยไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-trigger' },
      { id: 'occasional', label: 'มีบ้างเป็นครั้งคราว', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-trigger' },
      { id: 'frequent', label: 'มีบ่อย เป็นๆ หายๆ หาสาเหตุไม่เจอ', scores: { scoreSkin: 3 }, nextQuestionId: 'skin-trigger' },
    ],
  },
  {
    id: 'skin-trigger',
    text: 'ผื่นหรืออาการคันสัมพันธ์กับอาหาร ฝุ่น หรือสิ่งแวดล้อมบางอย่างไหม?',
    answers: [
      { id: 'unsure', label: 'ไม่แน่ใจ/ไม่เกี่ยว', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-acne' },
      { id: 'suspect', label: 'สงสัยว่าเกี่ยว แต่ไม่รู้ตัวกระตุ้นแน่ชัด', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-acne' },
      { id: 'confident', label: 'มั่นใจว่าเกี่ยวกับบางอย่าง แต่ยังไม่เคยตรวจ', scores: { scoreSkin: 3 }, nextQuestionId: 'skin-acne' },
    ],
  },
  {
    id: 'skin-acne',
    text: 'สิวหรือผิวมันขึ้นเป็นรอบ ๆ (สัมพันธ์กับฮอร์โมน) ไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-dullness' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-dullness' },
      { id: 'cyclical', label: 'มีชัดเจนเป็นรอบ', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-dullness' },
    ],
  },
  {
    id: 'skin-dullness',
    text: 'ผิวหมองคล้ำ ไม่สดใสเหมือนก่อนไหม?',
    answers: [
      { id: 'no', label: 'ไม่รู้สึก', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-impact' },
      { id: 'somewhat', label: 'รู้สึกบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-impact' },
      { id: 'clearly', label: 'รู้สึกชัดเจน', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-impact' },
    ],
  },
  {
    id: 'skin-impact',
    text: 'อาการทางผิวกระทบความมั่นใจหรือชีวิตประจำวันแค่ไหน?',
    answers: [
      { id: 'low', label: 'ไม่ค่อยกระทบ', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-duration' },
      { id: 'some', label: 'กระทบบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-duration' },
      { id: 'high', label: 'กระทบค่อนข้างมาก', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-duration' },
    ],
  },
  {
    id: 'skin-duration',
    text: 'เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน', scores: { scoreSkin: 0 } },
      { id: 'months', label: '1-6 เดือน', scores: { scoreSkin: 1 } },
      { id: 'chronic', label: 'มากกว่า 6 เดือนหรือเรื้อรัง', scores: { scoreSkin: 2 } },
    ],
  },
];

const skinResults = [
  {
    id: 'skin-high',
    title: 'มีสัญญาณผิวที่ควรให้แพทย์ตรวจแยกให้ชัดเจน',
    summary: 'ผื่น อาการคัน หรือผิวแห้งของคุณค่อนข้างชัดเจน อาจเป็นผิวแห้งขาดความชุ่มชื้น หรือมีสารก่อภูมิแพ้ร่วมด้วย ควรให้แพทย์ตรวจแยกให้แน่ชัด',
    threshold: { scoreSkin: 8 },
    nurtureSegment: 'booth-skin-high',
    recommendedSteps: [
      'ปรึกษาทีมแพทย์เพื่อแยกว่าเป็นผิวแห้งขาดความชุ่มชื้นหรือมีสารก่อภูมิแพ้ร่วมด้วย',
      'พิจารณาตรวจภูมิแพ้ IgE ถ้าสงสัยตัวกระตุ้น',
      'เสริมความชุ่มชื้นและสารต้านอนุมูลอิสระจากภายในถ้าเน้นผิวแห้งหมองคล้ำ',
    ],
    cta: boothCta,
  },
  {
    id: 'skin-moderate',
    title: 'เริ่มมีสัญญาณผิวที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ผิวแห้งหรือผื่นที่เริ่มรบกวน ควรสังเกตต่อเนื่องและปรึกษาแพทย์หากไม่ดีขึ้น',
    threshold: { scoreSkin: 4 },
    nurtureSegment: 'booth-skin-moderate',
    recommendedSteps: [
      'จดว่าผื่นหรือผิวแห้งเกิดขึ้นหลังสัมผัสอะไรบ้าง',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'เสริมความชุ่มชื้นผิวสม่ำเสมอ',
    ],
    cta: boothCta,
  },
  {
    id: 'skin-early',
    title: 'ภาพรวมผิวยังค่อนข้างปกติ',
    summary: 'คำตอบยังไม่ชี้ไปที่ความผิดปกติทางผิวชัดเจน เหมาะกับการดูแลผิวพื้นฐานต่อเนื่อง',
    threshold: { enteredSkin: 1 },
    nurtureSegment: 'booth-skin-early',
    recommendedSteps: [
      'ดูแลความชุ่มชื้นผิวและกันแดดสม่ำเสมอ',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

const vitaminQuestions = [
  {
    id: 'vitamin-fatigue',
    text: 'รู้สึกอ่อนเพลีย เพลียง่ายไหม ทั้งที่พักผ่อนพอ?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0, enteredVitamin: 1 }, nextQuestionId: 'vitamin-hairnails' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1, enteredVitamin: 1 }, nextQuestionId: 'vitamin-hairnails' },
      { id: 'frequent', label: 'มีบ่อย เพลียง่ายผิดปกติ', scores: { scoreVitamin: 2, enteredVitamin: 1 }, nextQuestionId: 'vitamin-hairnails' },
    ],
  },
  {
    id: 'vitamin-hairnails',
    text: 'ผมร่วง เล็บเปราะ หรือแผลหายช้าไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-aches' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-aches' },
      { id: 'clear', label: 'มีชัดเจน', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-aches' },
    ],
  },
  {
    id: 'vitamin-aches',
    text: 'ปวดเมื่อยกล้ามเนื้อ ตะคริว หรือปวดกระดูกบ่อยไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-diet' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-diet' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-diet' },
    ],
  },
  {
    id: 'vitamin-diet',
    text: 'กินผัก ผลไม้ หรืออาหารหลากหลายครบ 5 หมู่สม่ำเสมอไหม?',
    answers: [
      { id: 'varied', label: 'ครบและหลากหลายดี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-immunity' },
      { id: 'somewhat', label: 'พอได้ แต่ไม่ค่อยหลากหลาย', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-immunity' },
      { id: 'repetitive', label: 'กินซ้ำๆ ไม่ค่อยหลากหลาย หรือกินไม่ตรงเวลา', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-immunity' },
    ],
  },
  {
    id: 'vitamin-immunity',
    text: 'มีภูมิแพ้ง่าย ป่วยบ่อย หรือแผลในปากขึ้นบ่อยไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-focus' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-focus' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-focus' },
    ],
  },
  {
    id: 'vitamin-focus',
    text: 'สมองล้า ความจำหรือสมาธิลดลงไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-history' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-history' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-history' },
    ],
  },
  {
    id: 'vitamin-history',
    text: 'เคยตรวจระดับวิตามิน/แร่ธาตุมาก่อนไหม?',
    answers: [
      { id: 'tested-normal', label: 'เคยตรวจแล้วปกติ', scores: { scoreVitamin: 0 } },
      { id: 'never-tested', label: 'ไม่เคยตรวจ อยากรู้ระดับตัวเอง', scores: { scoreVitamin: 2 } },
      { id: 'tested-deficient', label: 'เคยตรวจแล้วพบว่าขาดบางตัว', scores: { scoreVitamin: 3 } },
    ],
  },
];

const vitaminResults = [
  {
    id: 'vitamin-high',
    title: 'มีสัญญาณที่ควรตรวจระดับวิตามิน/แร่ธาตุ',
    summary: 'อาการอ่อนเพลีย ผม เล็บ หรือภูมิคุ้มกันของคุณค่อนข้างชัดเจน อาจเกี่ยวข้องกับการขาดวิตามินหรือแร่ธาตุบางตัว ควรตรวจเพื่อรู้ระดับที่แน่ชัด',
    threshold: { scoreVitamin: 8 },
    nurtureSegment: 'booth-vitamin-high',
    recommendedSteps: [
      'พิจารณาตรวจ OligoScan (ไม่เจาะเลือด รู้ผลไว เหมาะกับวันนี้ที่บูธ)',
      'ปรึกษาทีมแพทย์เรื่องอาหารเสริมที่เหมาะกับผลตรวจ',
      'ปรับอาหารให้หลากหลายระหว่างรอผลตรวจ',
    ],
    cta: boothCta,
  },
  {
    id: 'vitamin-moderate',
    title: 'เริ่มมีสัญญาณที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ความเป็นไปได้ที่จะขาดวิตามินหรือแร่ธาตุบางตัว ควรสังเกตต่อเนื่องและพิจารณาตรวจเช็ก',
    threshold: { scoreVitamin: 4 },
    nurtureSegment: 'booth-vitamin-moderate',
    recommendedSteps: [
      'ปรับอาหารให้หลากหลายและครบ 5 หมู่มากขึ้น',
      'ปรึกษาทีมแพทย์ที่บูธเรื่อง OligoScan เบื้องต้น',
      'สังเกตอาการอ่อนเพลียหรือภูมิคุ้มกันต่อเนื่อง',
    ],
    cta: boothCta,
  },
  {
    id: 'vitamin-early',
    title: 'ภาพรวมยังไม่มีสัญญาณขาดวิตามินชัดเจน',
    summary: 'คำตอบยังไม่ชี้ไปที่การขาดวิตามินหรือแร่ธาตุชัดเจน เหมาะกับการดูแลอาหารพื้นฐานต่อเนื่อง',
    threshold: { enteredVitamin: 1 },
    nurtureSegment: 'booth-vitamin-early',
    recommendedSteps: [
      'รักษาความหลากหลายของอาหารต่อเนื่อง',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

const stressQuestions = [
  {
    id: 'stress-wake',
    text: 'ตื่นนอนตอนเช้ารู้สึกอย่างไร?',
    helper: 'เลือกข้อที่ใกล้เคียงที่สุดในช่วงนี้',
    answers: [
      { id: 'rested', label: 'สดชื่น พร้อมเริ่มวันได้เลย', scores: { scoreStress: 0, enteredStress: 1 }, nextQuestionId: 'stress-afternoon' },
      { id: 'slow-start', label: 'พอไปได้ ต้องใช้เวลาหน่อยกว่าจะตื่นตัว', scores: { scoreStress: 1, enteredStress: 1 }, nextQuestionId: 'stress-afternoon' },
      { id: 'exhausted', label: 'เหนื่อยตั้งแต่ตื่น รู้สึกว่าไม่ได้นอนเลย', scores: { scoreStress: 3, enteredStress: 1 }, nextQuestionId: 'stress-afternoon' },
    ],
  },
  {
    id: 'stress-afternoon',
    text: 'ช่วงบ่าย 14:00–16:00 รู้สึกอย่างไร?',
    answers: [
      { id: 'normal', label: 'มีพลังงานปกติ ทำงานได้ตามปกติ', scores: { scoreStress: 0 }, nextQuestionId: 'stress-cravings' },
      { id: 'mild-slump', label: 'ง่วงเล็กน้อย แต่พอสู้ต่อได้', scores: { scoreStress: 1 }, nextQuestionId: 'stress-cravings' },
      { id: 'severe-slump', label: 'ง่วงมากจนทำงานต่อแทบไม่ได้ ต้องพึ่งกาแฟหรือของหวาน', scores: { scoreStress: 3 }, nextQuestionId: 'stress-cravings' },
    ],
  },
  {
    id: 'stress-cravings',
    text: 'อยากของหวานหรือของเค็มบ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'แทบไม่เลย', scores: { scoreStress: 0 }, nextQuestionId: 'stress-weight' },
      { id: 'some-days', label: 'บางวันอยาก โดยเฉพาะตอนเครียดหรือตอนบ่าย', scores: { scoreStress: 1 }, nextQuestionId: 'stress-weight' },
      { id: 'daily', label: 'อยากเกือบทุกวัน ถ้าไม่ได้กินจะหงุดหงิดหรืออ่อนแรง', scores: { scoreStress: 2 }, nextQuestionId: 'stress-weight' },
    ],
  },
  {
    id: 'stress-weight',
    text: 'น้ำหนักเปลี่ยนแปลงทั้งที่คุมอาหาร / ออกกำลังกายอยู่?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน ปกติดี', scores: { scoreStress: 0 }, nextQuestionId: 'stress-level' },
      { id: 'slight-change', label: 'เปลี่ยนเล็กน้อย รู้สึกว่าร่างกายตอบสนองช้าลง', scores: { scoreStress: 1 }, nextQuestionId: 'stress-level' },
      { id: 'stuck-or-up', label: 'ลดไม่ลงเลย หรือขึ้นทั้งที่พยายามมาก', scores: { scoreStress: 2 }, nextQuestionId: 'stress-level' },
    ],
  },
  {
    id: 'stress-level',
    text: 'ความเครียดสะสมในชีวิตตอนนี้อยู่ระดับไหน?',
    answers: [
      { id: 'low', label: 'น้อย จัดการได้ดี', scores: { scoreStress: 0 }, nextQuestionId: 'stress-duration' },
      { id: 'moderate', label: 'ปานกลาง มีบ้างแต่ผ่านได้', scores: { scoreStress: 1 }, nextQuestionId: 'stress-duration' },
      { id: 'high', label: 'สูงมาก รู้สึกหนักและเหนื่อยตลอดเวลา', scores: { scoreStress: 2 }, nextQuestionId: 'stress-duration' },
    ],
  },
  {
    id: 'stress-duration',
    text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน เพิ่งเริ่มสังเกตเห็น', scores: { scoreStress: 0 } },
      { id: '1-6-months', label: '1–6 เดือน เป็นๆ หายๆ', scores: { scoreStress: 2 } },
      { id: 'over-6-months', label: 'มากกว่า 6 เดือน หรือรู้สึกว่าเป็นปัญหาเรื้อรัง', scores: { scoreStress: 3 } },
    ],
  },
];

const stressResults = [
  {
    id: 'stress-high',
    title: 'ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว',
    summary: 'ผลประเมินแสดงระดับความเสี่ยงสูง อาการที่คุณมีสอดคล้องกับภาวะต่อมหมวกไตล้าในระยะที่ควรได้รับการดูแล ยิ่งเริ่มรักษาเร็วเท่าไหร่ ระยะเวลาฟื้นตัวยิ่งสั้นลง',
    threshold: { scoreStress: 9 },
    nurtureSegment: 'booth-stress-high',
    recommendedSteps: [
      'ตรวจระดับ Cortisol และ DHEA ด้วยการเจาะเลือด',
      'วางแผนการรักษาเฉพาะบุคคลกับแพทย์',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
    ],
    cta: boothCta,
  },
  {
    id: 'stress-moderate',
    title: 'ฮอร์โมนเริ่มไม่สมดุล — ควรตรวจ Cortisol & DHEA',
    summary: 'ผลประเมินชี้ว่าอาการของคุณตรงกับหลายสัญญาณของภาวะต่อมหมวกไตล้า การตรวจเลือดเพื่อวัดระดับฮอร์โมนโดยตรงจะช่วยยืนยันและวางแผนการรักษาเฉพาะบุคคลได้',
    threshold: { scoreStress: 4 },
    nurtureSegment: 'booth-stress-moderate',
    recommendedSteps: [
      'ตรวจระดับ Cortisol และ DHEA เพื่อยืนยัน',
      'ปรึกษาแพทย์เรื่องการปรับวิถีชีวิตและอาหารเสริม',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
    ],
    cta: boothCta,
  },
  {
    id: 'stress-early',
    title: 'เริ่มมีสัญญาณเตือน — ดูแลก่อนสาย',
    summary: 'ผลประเมินแสดงว่าคุณมีอาการบางส่วนที่อาจบ่งชี้ถึงภาวะเริ่มต้น การพูดคุยกับแพทย์เพื่อตรวจระดับ Cortisol และ DHEA จะช่วยให้รู้แน่ชัดและป้องกันได้ตั้งแต่เนิ่นๆ',
    threshold: { enteredStress: 1 },
    nurtureSegment: 'booth-stress-early',
    recommendedSteps: [
      'พูดคุยกับแพทย์เพื่อประเมินความเสี่ยงเบื้องต้น',
      'ตรวจระดับ Cortisol และ DHEA เพื่อรู้แน่ชัด',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
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
    ...metabolismQuestions,
    ...liverQuestions,
    ...skinQuestions,
    ...vitaminQuestions,
    ...stressQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
    ...liverResults,
    ...skinResults,
    ...vitaminResults,
    ...stressResults,
  ],
};
