import React, { useState, useMemo } from 'react';
import { Student, ViolationRecord, ParentSummons, DisciplineStatus } from '../types';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Sparkles,
  ArrowRight,
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

interface StudentRosterProps {
  students: Student[];
  violations: ViolationRecord[];
  summonsList: ParentSummons[];
  onSelectStudent: (student: Student) => void;
  onOpenNewViolationForStudent: (student: Student) => void;
  onOpenNewSummonsForStudent: (student: Student) => void;
  onReducePoints: (studentId: string, pointsToReduce: number, reason: string) => void;
  onOpenAICounselor: (student: Student) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  violations,
  summonsList,
  onSelectStudent,
  onOpenNewViolationForStudent,
  onOpenNewSummonsForStudent,
  onReducePoints,
  onOpenAICounselor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Selected student for detailed slide-over
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'violations' | 'summons' | 'reduce'>('violations');

  // Point reduction form state
  const [reduceAmount, setReduceAmount] = useState<number>(10);
  const [reduceReason, setReduceReason] = useState<string>('Menunjukkan perubahan sikap positif dan aktif dalam kegiatan literasi/ekstrakurikuler');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchClass = selectedClass === 'all' || s.classGrade === selectedClass;
      const matchStatus = selectedStatus === 'all' || s.disciplineStatus === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Violations of currently active student
  const studentViolations = useMemo(() => {
    if (!activeStudent) return [];
    return violations.filter(v => v.studentId === activeStudent.id);
  }, [violations, activeStudent]);

  // Summons of currently active student
  const studentSummons = useMemo(() => {
    if (!activeStudent) return [];
    return summonsList.filter(s => s.studentId === activeStudent.id);
  }, [summonsList, activeStudent]);

  const handleReduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    onReducePoints(activeStudent.id, Number(reduceAmount), reduceReason);
    
    // Update local active student points
    const newTotal = Math.max(0, activeStudent.totalPoints - Number(reduceAmount));
    setActiveStudent({
      ...activeStudent,
      totalPoints: newTotal,
    });
    setActiveTab('violations');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Buku Induk Kedisiplinan Siswa
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Daftar Siswa & Riwayat Akumulasi Poin Disiplin</span>
            <span aria-hidden="true">·</span>
            <span>SMP Negeri 1 Kota Pontianak</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900 tabular-nums">{students.length}</span>
          <span>total siswa terdaftar</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN, ortu..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kelas</option>
              <option value="VII-A">Kelas VII-A</option>
              <option value="VII-B">Kelas VII-B</option>
              <option value="VII-C">Kelas VII-C</option>
              <option value="VII-D">Kelas VII-D</option>
              <option value="VIII-A">Kelas VIII-A</option>
              <option value="VIII-B">Kelas VIII-B</option>
              <option value="VIII-C">Kelas VIII-C</option>
              <option value="VIII-D">Kelas VIII-D</option>
              <option value="IX-A">Kelas IX-A</option>
              <option value="IX-B">Kelas IX-B</option>
              <option value="IX-C">Kelas IX-C</option>
              <option value="IX-D">Kelas IX-D</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Kedisiplinan</option>
              <option value="Aman">Aman (&lt; 10 Pts)</option>
              <option value="Peringatan Lisan">Peringatan Lisan (10 - 24 Pts)</option>
              <option value="Panggilan Ortu I">Panggilan Ortu I (25 - 49 Pts)</option>
              <option value="Panggilan Ortu II">Panggilan Ortu II (50 - 74 Pts)</option>
              <option value="Panggilan Keras / Skorsing">Panggilan Keras / Skorsing (&ge; 75 Pts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((st) => {
          const hasHighPoints = st.totalPoints >= 50;
          return (
            <div
              key={st.id}
              onClick={() => {
                setActiveStudent(st);
                setActiveTab('violations');
              }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {st.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{st.classGrade}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{st.nisn}</span>
                    </div>
                  </div>

                  {/* Points Pill */}
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      st.totalPoints >= 75
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : st.totalPoints >= 50
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : st.totalPoints >= 25
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : st.totalPoints >= 10
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {st.totalPoints} pts
                    </span>
                  </div>
                </div>

                {/* Status indicator line */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${
                    hasHighPoints ? 'text-red-700' : st.totalPoints >= 25 ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                    {st.disciplineStatus}
                  </span>
                  <span className="text-slate-400">
                    Wali: {st.homeroomTeacher}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="truncate">
                    <span className="text-slate-400">Orang Tua:</span> {st.parentName}
                  </div>
                  <div className="truncate font-mono text-[11px]">
                    <span className="text-slate-400">Kontak:</span> {st.parentPhone}
                  </div>
                </div>
              </div>

              {/* Card Footer action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span>Buka Rekam Jejak</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over / Modal for Student Details */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{activeStudent.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                    {activeStudent.classGrade}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>NISN: <strong className="font-mono text-slate-700">{activeStudent.nisn}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Wali Kelas: {activeStudent.homeroomTeacher}</span>
                  <span aria-hidden="true">·</span>
                  <span>Total Poin: <strong className="font-mono text-red-600">{activeStudent.totalPoints} pts</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAICounselor(activeStudent)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Analisis Bimbingan Konseling Berbasis AI"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Saran Konseling AI
                </button>
                <button
                  onClick={() => setActiveStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Parent & Contact Strip */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-500">Orang Tua/Wali:</span>{' '}
                  <strong className="text-slate-800">{activeStudent.parentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Telepon:</span>{' '}
                  <strong className="font-mono text-slate-800">{activeStudent.parentPhone}</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenNewViolationForStudent(activeStudent);
                    setActiveStudent(null);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded"
                >
                  + Tambah Pelanggaran
                </button>
                <button
                  onClick={() => {
                    onOpenNewSummonsForStudent(activeStudent);
                    setActiveStudent(null);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                >
                  + Terbitkan Panggilan
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 px-6 border-b border-slate-200 bg-white text-xs font-medium">
              <button
                onClick={() => setActiveTab('violations')}
                className={`py-3 border-b-2 font-semibold transition-colors ${
                  activeTab === 'violations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Riwayat Pelanggaran ({studentViolations.length})
              </button>
              <button
                onClick={() => setActiveTab('summons')}
                className={`py-3 border-b-2 font-semibold transition-colors ${
                  activeTab === 'summons'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Surat Panggilan & BAP ({studentSummons.length})
              </button>
              <button
                onClick={() => setActiveTab('reduce')}
                className={`py-3 border-b-2 font-semibold transition-colors ${
                  activeTab === 'reduce'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Pemutihan / Reduksi Poin Prestasi
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
              
              {/* Tab 1: Violations */}
              {activeTab === 'violations' && (
                <div className="space-y-3">
                  {studentViolations.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada catatan pelanggaran aktif</p>
                      <p className="text-xs text-slate-400">Siswa mematuhi seluruh tata tertib sekolah dengan baik</p>
                    </div>
                  ) : (
                    studentViolations.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                          <span className="font-mono text-slate-700">{v.date} · {v.time} WIB ({v.location})</span>
                          <span className="font-bold text-red-600 font-mono">+{v.points} Poin</span>
                        </div>
                        <div className="font-semibold text-slate-800">{v.category}</div>
                        <p className="text-slate-600 mt-0.5">{v.description}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Pelapor: {v.reporterName} ({v.reporterRole})</span>
                          <span className="font-semibold text-slate-700">Status: {v.followUpStatus}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Summons & BAP */}
              {activeTab === 'summons' && (
                <div className="space-y-3">
                  {studentSummons.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">Belum pernah diterbitkan surat panggilan</p>
                      <p className="text-xs text-slate-400">Pemanggilan diterbitkan jika poin mencapai ambang batas batas tata tertib</p>
                    </div>
                  ) : (
                    studentSummons.map((s) => (
                      <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-900">{s.letterNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            s.status === 'Hadir - BAP Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="text-slate-700">{s.reasonSummary}</div>
                        <div className="text-slate-500 text-[11px]">
                          Jadwal: {s.scheduledDate} {s.scheduledTime} di {s.locationRoom}
                        </div>
                        {s.bapNotes && (
                          <div className="mt-2 p-2 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                            <strong>Hasil Kesepakatan BK: </strong>{s.bapNotes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Reduksi / Pemutihan Poin */}
              {activeTab === 'reduce' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900">Program Apresiasi & Pemutihan Poin</h4>
                      <p className="text-[11px] text-slate-500">
                        Pengurangan poin tata tertib bagi siswa yang menunjukkan perbaikan budi pekerti atau berprestasi
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleReduceSubmit} className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jumlah Poin yang Dikurangi
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={activeStudent.totalPoints}
                        value={reduceAmount}
                        onChange={(e) => setReduceAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Alasan / Bentuk Prestasi & Perubahan Positif
                      </label>
                      <textarea
                        rows={2}
                        value={reduceReason}
                        onChange={(e) => setReduceReason(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                      >
                        Terapkan Pengurangan Poin
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
