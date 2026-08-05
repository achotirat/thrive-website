export interface DoctorProfile {
  name: string
  title: string
  image: string
  imageAlt: string
  bio: string
  specializations: string[]
}

export type DoctorKey = 'noon' | 'pijak'

export const DOCTORS: Record<DoctorKey, DoctorProfile> = {
  noon: {
    name: 'พญ. ชนากานต์ ตระหง่านศรี',
    title: 'แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ',
    image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
    imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ Thrive Wellness',
    bio: 'ผู้เชี่ยวชาญด้านเวชศาสตร์ชะลอวัยและโภชนาการ ดูแลการตรวจวิเคราะห์สุขภาพเชิงลึก พร้อมให้คำปรึกษาแผนสุขภาพเฉพาะบุคคลที่ Thrive Wellness Clinic',
    specializations: ['Anti-aging & Regenerative Medicine', 'Nutrition Wellness', 'Functional Medicine'],
  },
  pijak: {
    name: 'นายแพทย์พิจักษณ์ วงศ์วิศิษฎ์',
    title: 'Preventive & Regenerative Medicine (หมอบาย)',
    image: '/dr-pijak-wongvisit-thrive-400x400.jpg',
    imageAlt: 'นายแพทย์พิจักษณ์ วงศ์วิศิษฎ์ หมอบาย Thrive Wellness Clinic',
    bio: 'หมอบายดูแลด้วยมุมมอง Preventive Medicine — เชื่อมโยงผลฮอร์โมนและวิตามินเข้ากับพันธุกรรมและไลฟ์สไตล์ของแต่ละคน เพื่อวางแผนชะลอความเสื่อมและป้องกันปัญหาสุขภาพตั้งแต่เนิ่น ๆ ไม่ใช่แค่ดูตัวเลขแยกส่วน',
    specializations: ['Preventive Medicine', 'Hormone Balance', 'Regenerative Medicine', 'Genetic Counseling'],
  },
}
