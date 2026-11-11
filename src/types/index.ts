export type ClassGrade = 
  | 'VII-A' | 'VII-B' | 'VII-C' | 'VII-D' | 'VII-E'
  | 'VIII-A' | 'VIII-B' | 'VIII-C' | 'VIII-D' | 'VIII-E'
  | 'IX-A' | 'IX-B' | 'IX-C' | 'IX-D' | 'IX-E';

export type DisciplineStatus = 'Aman' | 'Peringatan Lisan' | 'Panggilan Ortu I' | 'Panggilan Ortu II' | 'Panggilan Keras / Skorsing';

export type ViolationCategory = 
  | 'Kedisiplinan & Waktu'
  | 'Kerapian & Atribut Seragam'
  | 'KBM & Sikap Akademik'
  | 'Etika & Sopan Santun'
  | 'Pelanggaran Berat & Ketertiban';

export type FollowUpStatus = 'Baru' | 'Konseling BK' | 'Panggilan Ortu' | 'Selesai Terbina';

export type SummonsStage = 'Tahap 1' | 'Tahap 2' | 'Tahap 3' | 'Khusus/Mendesak';

export type SummonsStatus = 'Dijadwalkan' | 'Hadir - BAP Selesai' | 'Tidak Hadir' | 'Dibatalkan';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classGrade: ClassGrade;
  homeroomTeacher: string;
  parentName: string;
  parentPhone: string;
  parentAddress: string;
  totalPoints: number;
  disciplineStatus: DisciplineStatus;
  notes?: string;
}

export interface CatalogViolation {
  id: string;
  code: string;
  category: ViolationCategory;
  name: string;
  points: number;
  defaultSanction: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: ClassGrade;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  catalogId?: string;
  category: ViolationCategory;
  description: string;
  points: number;
  reporterName: string;
  reporterRole: 'Guru Piket' | 'Guru BK' | 'Wali Kelas' | 'Guru Mapel' | 'Waka Kesiswaan';
  immediateAction: string;
  followUpStatus: FollowUpStatus;
  followUpNotes?: string;
  handledByBK?: string;
  handledDate?: string;
}

export interface ParentSummons {
  id: string;
  letterNumber: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classGrade: ClassGrade;
  parentName: string;
  parentPhone: string;
  summonsStage: SummonsStage;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm WIB
  locationRoom: string;
  reasonSummary: string;
  violationRecordIds: string[];
  accumulatedPointsAtCall: number;
  counselorTeacher: string;
  homeroomTeacher: string;
  principalName: string;
  principalNIP: string;
  status: SummonsStatus;
  attendanceDate?: string;
  bapNotes?: string;
  studentCommitment?: string;
  parentAgreement?: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  accreditation: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  postalCode: string;
  principalName: string;
  principalNIP: string;
  bkCoordinator: string;
  bkCoordinatorNIP: string;
  vicePrincipalStudentAffairs: string;
}
