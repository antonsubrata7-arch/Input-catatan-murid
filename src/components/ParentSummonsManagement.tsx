import React, { useState, useMemo } from 'react';
import { ParentSummons, Student, ViolationRecord, SchoolProfile, SummonsStage, SummonsStatus } from '../types';
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Eye, 
  Trash2,
  User,
  Phone,
  Building,
  Check
} from 'lucide-react';

interface ParentSummonsManagementProps {
  summonsList: ParentSummons[];
  students: Student[];
  violations: ViolationRecord[];
  schoolProfile: SchoolProfile;
  onCreateSummons: (newSummons: Omit<ParentSummons, 'id'>) => void;
  onUpdateSummons: (updated: ParentSummons) => void;
  onDeleteSummons: (id: string) => void;
  onViewLetter: (summons: ParentSummons) => void;
  initialSelectedStudent?: Student | null;
}

export const ParentSummonsManagement: React.FC<ParentSummonsManagementProps> = ({
  summonsList,
  students,
  violations,
  schoolProfile,
  onCreateSummons,
  onUpdateSummons,
  onDeleteSummons,
  onViewLetter,
  initialSelectedStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Modal create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(initialSelectedStudent));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialSelectedStudent?.id || '');
  const [summonsStage, setSummonsStage] = useState<SummonsStage>('Tahap 1');
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState<string>('08:30 WIB');
  const [locationRoom, setLocationRoom] = useState<string>('Ruang Bimbingan Konseling (BK) Lantai 1');
  const [reasonSummary, setReasonSummary] = useState<string>('');
  const [counselorTeacher, setCounselorTeacher] = useState<string>(schoolProfile.bkCoordinator);
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);

  // Find target student
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // When student changes, update defaults
  React.useEffect(() => {
    if (activeStudent) {
      // Find violations for this student
      const studentViolations = violations.filter(v => v.studentId === activeStudent.id);
      setSelectedViolationIds(studentViolations.slice(0, 3).map(v => v.id));

      // Auto pick stage based on points
      if (activeStudent.totalPoints >= 75) setSummonsStage('Tahap 3');
      else if (activeStudent.totalPoints >= 50) setSummonsStage('Tahap 2');
      else setSummonsStage('Tahap 1');

      // Auto generate reason
      const sampleViolations = studentViolations.slice(0, 2).map(v => v.description).join('; ');
      setReasonSummary(
        `Pembinaan kedisiplinan dan koordinasi bersama orang tua sehubungan akumulasi ${activeStudent.totalPoints} poin pelanggaran tata tertib (${sampleViolations || 'Pelanggaran tata tertib sekolah'}).`
      );
    }
  }, [activeStudent, violations]);

  // Filtered summons
  const filteredSummons = useMemo(() => {
    return summonsList.filter(s => {
      const matchSearch = 
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchStage = selectedStage === 'all' || s.summonsStage === selectedStage;

      return matchSearch && matchStatus && matchStage;
    });
  }, [summonsList, searchQuery, selectedStatus, selectedStage]);

  // Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    // Automatic letter number
    const sequence = String(summonsList.length + 80).padStart(3, '0');
    const autoNumber = `421.3/${sequence}/SMPN.1/BK/2026`;

    onCreateSummons({
      letterNumber: autoNumber,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      nisn: activeStudent.nisn,
      classGrade: activeStudent.classGrade,
      parentName: activeStudent.parentName,
      parentPhone: activeStudent.parentPhone,
      summonsStage,
      scheduledDate,
      scheduledTime,
      locationRoom,
      reasonSummary,
      violationRecordIds: selectedViolationIds,
      accumulatedPointsAtCall: activeStudent.totalPoints,
      counselorTeacher,
      homeroomTeacher: activeStudent.homeroomTeacher,
      principalName: schoolProfile.principalName,
      principalNIP: schoolProfile.principalNIP,
      status: 'Dijadwalkan',
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pemanggilan Orang Tua & Wali Murid
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Penerbitan Surat Resmi & Berita Acara BAP</span>
            <span aria-hidden="true">·</span>
            <span>SMP Negeri 1 Kota Pontianak</span>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Buat Surat Panggilan Baru
        </button>
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
              placeholder="Cari siswa, no. surat, ortu..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Kehadiran</option>
              <option value="Dijadwalkan">Dijadwalkan (Menunggu Kehadiran)</option>
              <option value="Hadir - BAP Selesai">Hadir - BAP Selesai & Perjanjian</option>
              <option value="Tidak Hadir">Tidak Hadir (Perlu Reschedule)</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Tahap Pemanggilan</option>
              <option value="Tahap 1">Tahap 1 (Peringatan Awal / 25-49 Poin)</option>
              <option value="Tahap 2">Tahap 2 (Panggilan Ortu II / 50-74 Poin)</option>
              <option value="Tahap 3">Tahap 3 (Panggilan Keras / Skorsing &gt;= 75 Poin)</option>
              <option value="Khusus/Mendesak">Khusus / Kasus Mendesak</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Menampilkan <strong className="text-slate-800 tabular-nums">{filteredSummons.length}</strong> agenda pemanggilan</span>
          {filteredSummons.some(s => s.status === 'Dijadwalkan') && (
            <span className="text-blue-700 font-medium">
              {filteredSummons.filter(s => s.status === 'Dijadwalkan').length} undangan menunggu kehadiran
            </span>
          )}
        </div>
      </div>

      {/* Summons List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSummons.length === 0 ? (
          <div className="lg:col-span-2 bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800">Tidak ada agenda pemanggilan yang cocok</h4>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan filter lain atau buat surat panggilan baru</p>
          </div>
        ) : (
          filteredSummons.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header item */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {item.letterNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.summonsStage === 'Tahap 3'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : item.summonsStage === 'Tahap 2'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.summonsStage}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {item.studentName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Kelas {item.classGrade}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">NISN: {item.nisn}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-red-600 font-mono">{item.accumulatedPointsAtCall} Pts</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 ${
                    item.status === 'Hadir - BAP Selesai'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'Dijadwalkan'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Orang Tua / Wali:</span>
                    <strong className="text-slate-800">{item.parentName}</strong>
                    <span className="text-slate-400 font-mono text-[11px]">({item.parentPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Jadwal Menghadap:</span>
                    <strong className="text-slate-800 font-medium">
                      {item.scheduledDate} · {item.scheduledTime}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Tempat:</span>
                    <span>{item.locationRoom}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 mt-2 text-[11px] leading-relaxed">
                    <span className="font-semibold text-slate-900">Perihal: </span>
                    {item.reasonSummary}
                  </div>

                  {/* If BAP is completed, show commitment summary */}
                  {item.bapNotes && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 mt-2 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hasil BAP & Kesepakatan
                      </div>
                      <p className="line-clamp-2">{item.bapNotes}</p>
                      {item.studentCommitment && (
                        <p className="italic text-emerald-700">" {item.studentCommitment} "</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (confirm(`Hapus berkas pemanggilan ${item.letterNumber}?`)) {
                        onDeleteSummons(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Hapus Surat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewLetter(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Lihat & Cetak Surat
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Parent Summons */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Penerbitan Surat Panggilan Orang Tua / Wali
                </h3>
                <p className="text-xs text-slate-500">
                  SMP Negeri 1 Kota Pontianak · Format Kedinasan Resmi
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              
              {/* Student Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Siswa yang Dipanggil <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.classGrade}) - Total: {s.totalPoints} Poin [{s.disciplineStatus}]
                    </option>
                  ))}
                </select>
              </div>

              {activeStudent && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="font-semibold text-slate-900">
                    Orang Tua / Wali: {activeStudent.parentName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Telepon: <span className="font-mono">{activeStudent.parentPhone}</span> · Alamat: {activeStudent.parentAddress}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Wali Kelas: {activeStudent.homeroomTeacher}
                  </div>
                </div>
              )}

              {/* Stage & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahapan Panggilan
                  </label>
                  <select
                    value={summonsStage}
                    onChange={(e) => setSummonsStage(e.target.value as SummonsStage)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Tahap 1">Tahap 1 (Peringatan Awal / 25-49 Pts)</option>
                    <option value="Tahap 2">Tahap 2 (Panggilan Ortu II / 50-74 Pts)</option>
                    <option value="Tahap 3">Tahap 3 (Panggilan Keras / Skorsing &gt;= 75 Pts)</option>
                    <option value="Khusus/Mendesak">Khusus / Pelanggaran Berat Insidental</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari / Tanggal Pertemuan
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="Contoh: 08:30 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Location & Counselor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ruang Pertemuan
                  </label>
                  <input
                    type="text"
                    value={locationRoom}
                    onChange={(e) => setLocationRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guru BK Pendamping
                  </label>
                  <input
                    type="text"
                    value={counselorTeacher}
                    onChange={(e) => setCounselorTeacher(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Perihal Pemanggilan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonSummary}
                  onChange={(e) => setReasonSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  Terbitkan Surat Panggilan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
