const PHONE_HREF = 'tel:+66959349640';

export const adrenalFatigueLpQuiz = {
  id: 'adrenal-fatigue-lp',
  serviceSlug: 'adrenal-fatigue',
  title: 'ประเมินอาการต่อมหมวกไตล้า',
  eyebrow: 'Adrenal Fatigue · symptom check · 6 ข้อ',
  intro: 'ตอบตามที่รู้สึกจริงในช่วง 2–4 สัปดาห์ที่ผ่านมา — ใช้เวลาไม่ถึง 2 นาที',
  startQuestionId: 'q1',
  questions: [
    {
      id: 'q1',
      text: 'ตื่นนอนตอนเช้ารู้สึกอย่างไร?',
      helper: 'เลือกข้อที่ใกล้เคียงที่สุดในช่วงนี้',
      answers: [
        { id: 'q1a', label: 'สดชื่น พร้อมเริ่มวันได้เลย', scores: {}, nextQuestionId: 'q2' },
        { id: 'q1b', label: 'พอไปได้ ต้องใช้เวลาหน่อยกว่าจะตื่นตัว', scores: { score: 1 }, nextQuestionId: 'q2' },
        { id: 'q1c', label: 'เหนื่อยตั้งแต่ตื่น รู้สึกว่าไม่ได้นอนเลย', scores: { score: 3 }, nextQuestionId: 'q2' },
      ],
    },
    {
      id: 'q2',
      text: 'ช่วงบ่าย 14:00–16:00 รู้สึกอย่างไร?',
      answers: [
        { id: 'q2a', label: 'มีพลังงานปกติ ทำงานได้ตามปกติ', scores: {}, nextQuestionId: 'q3' },
        { id: 'q2b', label: 'ง่วงเล็กน้อย แต่พอสู้ต่อได้', scores: { score: 1 }, nextQuestionId: 'q3' },
        { id: 'q2c', label: 'ง่วงมากจนทำงานต่อแทบไม่ได้ ต้องพึ่งกาแฟหรือของหวาน', scores: { score: 3 }, nextQuestionId: 'q3' },
      ],
    },
    {
      id: 'q3',
      text: 'อยากของหวานหรือของเค็มบ่อยแค่ไหน?',
      answers: [
        { id: 'q3a', label: 'แทบไม่เลย', scores: {}, nextQuestionId: 'q4' },
        { id: 'q3b', label: 'บางวันอยาก โดยเฉพาะตอนเครียดหรือตอนบ่าย', scores: { score: 1 }, nextQuestionId: 'q4' },
        { id: 'q3c', label: 'อยากเกือบทุกวัน ถ้าไม่ได้กินจะหงุดหงิดหรืออ่อนแรง', scores: { score: 2 }, nextQuestionId: 'q4' },
      ],
    },
    {
      id: 'q4',
      text: 'น้ำหนักเปลี่ยนแปลงทั้งที่คุมอาหาร / ออกกำลังกายอยู่?',
      answers: [
        { id: 'q4a', label: 'ไม่เปลี่ยน ปกติดี', scores: {}, nextQuestionId: 'q5' },
        { id: 'q4b', label: 'เปลี่ยนเล็กน้อย รู้สึกว่าร่างกายตอบสนองช้าลง', scores: { score: 1 }, nextQuestionId: 'q5' },
        { id: 'q4c', label: 'ลดไม่ลงเลย หรือขึ้นทั้งที่พยายามมาก', scores: { score: 2 }, nextQuestionId: 'q5' },
      ],
    },
    {
      id: 'q5',
      text: 'ความเครียดสะสมในชีวิตตอนนี้อยู่ระดับไหน?',
      answers: [
        { id: 'q5a', label: 'น้อย จัดการได้ดี', scores: {}, nextQuestionId: 'q6' },
        { id: 'q5b', label: 'ปานกลาง มีบ้างแต่ผ่านได้', scores: { score: 1 }, nextQuestionId: 'q6' },
        { id: 'q5c', label: 'สูงมาก รู้สึกหนักและเหนื่อยตลอดเวลา', scores: { score: 2 }, nextQuestionId: 'q6' },
      ],
    },
    {
      id: 'q6',
      text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
      answers: [
        { id: 'q6a', label: 'ไม่ถึงเดือน เพิ่งเริ่มสังเกตเห็น', scores: {} },
        { id: 'q6b', label: '1–6 เดือน เป็นๆ หายๆ', scores: { score: 2 } },
        { id: 'q6c', label: 'มากกว่า 6 เดือน หรือรู้สึกว่าเป็นปัญหาเรื้อรัง', scores: { score: 3 } },
      ],
    },
  ],
  results: [
    {
      id: 'high',
      title: 'ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว',
      summary: 'ผลประเมินแสดงระดับความเสี่ยงสูง อาการที่คุณมีสอดคล้องกับภาวะต่อมหมวกไตล้าในระยะที่ควรได้รับการดูแล ยิ่งเริ่มรักษาเร็วเท่าไหร่ ระยะเวลาฟื้นตัวยิ่งสั้นลง',
      threshold: { score: 9 },
      nurtureSegment: 'adrenal-high',
      recommendedSteps: [
        'ตรวจระดับ Cortisol และ DHEA ด้วยการเจาะเลือด',
        'วางแผนการรักษาเฉพาะบุคคลกับแพทย์',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรด่วน — นัดได้วันนี้ 095-934-9640', href: PHONE_HREF },
    },
    {
      id: 'moderate',
      title: 'ฮอร์โมนเริ่มไม่สมดุล — ควรตรวจ Cortisol & DHEA',
      summary: 'ผลประเมินชี้ว่าอาการของคุณตรงกับหลายสัญญาณของภาวะต่อมหมวกไตล้า การตรวจเลือดเพื่อวัดระดับฮอร์โมนโดยตรงจะช่วยยืนยันและวางแผนการรักษาเฉพาะบุคคลได้',
      threshold: { score: 4 },
      nurtureSegment: 'adrenal-moderate',
      recommendedSteps: [
        'ตรวจระดับ Cortisol และ DHEA เพื่อยืนยัน',
        'ปรึกษาแพทย์เรื่องการปรับวิถีชีวิตและอาหารเสริม',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรนัดตรวจ 095-934-9640', href: PHONE_HREF },
    },
    {
      id: 'early',
      title: 'เริ่มมีสัญญาณเตือน — ดูแลก่อนสาย',
      summary: 'ผลประเมินแสดงว่าคุณมีอาการบางส่วนที่อาจบ่งชี้ถึงภาวะเริ่มต้น การพูดคุยกับแพทย์เพื่อตรวจระดับ Cortisol และ DHEA จะช่วยให้รู้แน่ชัดและป้องกันได้ตั้งแต่เนิ่นๆ',
      threshold: {},
      nurtureSegment: 'adrenal-early',
      recommendedSteps: [
        'พูดคุยกับแพทย์เพื่อประเมินความเสี่ยงเบื้องต้น',
        'ตรวจระดับ Cortisol และ DHEA เพื่อรู้แน่ชัด',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรขอคำแนะนำฟรี 095-934-9640', href: PHONE_HREF },
    },
  ],
};
