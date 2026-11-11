import React, { useState, useMemo } from 'react';
import { ViolationRecord, Student, CatalogViolation, ViolationCategory, FollowUpStatus, ClassGrade } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  Download,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  UserCheck
} from 'lucide-react';

interface ViolationManagementProps {
  violations: ViolationRecord[];
  students: Student[];
  catalog: CatalogViolation[];
  onAddViolation: (record: Omit<ViolationRecord, 'id'>) => void;
  onUpdateViolation: (record: ViolationRecord) => void;
  onDeleteViolation: (id: string) => void;
  onCreateSummonsForStudent: (student: Student, relatedViolationIds: string[]) => void;
  onSelectStudent: (student: Student) => void;
}

export const ViolationManagement: React.FC<ViolationManagementProps> = ({
  violations,
  students,
  catalog,
  onAddViolation,
  onUpdateViolation,
  onDeleteViolation,
  onCreateSummonsForStudent,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailViolation, setDetailViolation] = useState<ViolationRecord | null>(null);

  // Form states for adding violation
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [violationDate, setViolationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [violationTime, setViolationTime] = useState<string>('07:30');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ViolationCategory>('Kedisiplinan & Waktu');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number>(10);
  const [location, setLocation] = useState<string>('Lingkungan Sekolah');
  const [reporterName, setReporterName] = useState<string>('Ahmad Dahlan, S.Pd.');
  const [reporterRole, setReporterRole] = useState<ViolationRecord['reporterRole']>('Guru Piket');
  const [immediateAction, setImmediateAction] = useState<string>('Pencatatan buku piket dan pembinaan lisan');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('Baru');

  // Find currently selected student in the form
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // When catalog item selected, auto-fill points, description, category
  const handleCatalogSelect = (catId: string) => {
    setSelectedCatalogId(catId);
    if (!catId) return;
    const item = catalog.find(c => c.id === catId);
    if (item) {
      setCustomCategory(item.category);
      setCustomDescription(item.name);
      setCustomPoints(item.points);
      setImmediateAction(item.defaultSanction);
    }
  };

  // Filtered violations
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchSearch = 
        v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const matchStat = selectedStatus === 'all' || v.followUpStatus === selectedStatus;
      const matchClass = selectedClass === 'all' || v.classGrade === selectedClass;

      return matchSearch && matchCat && matchStat && matchClass;
    });
  }, [violations, searchQuery, selectedCategory, selectedStatus, selectedClass]);

  // Handle Form Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    onAddViolation({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      classGrade: currentStudent.classGrade,
      date: violationDate,
      time: violationTime,
      location,
      catalogId: selectedCatalogId || undefined,
      category: customCategory,
      description: customDescription,
      points: Number(customPoints),
      reporterName,
      reporterRole,
      immediateAction,
      followUpStatus,
    });

    // Reset and close
    setIsAddModalOpen(false);
    setSelectedStudentId('');
    setSelectedCatalogId('');
    setCustomDescription('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Jam', 'Nama Siswa', 'Kelas', 'Kategori', 'Pelanggaran', 'Poin', 'Lokasi', 'Pelapor', 'Peran', 'Status Tindak Lanjut'];
    const rows = filteredViolations.map(v => [
      v.id,
      v.date,
      v.time,
      `"${v.studentName}"`,
      v.classGrade,
      `"${v.category}"`,
      `"${v.description.replace(/"/g, '""')}"`,
      v.points,
      `"${v.location}"`,
      `"${v.reporterName}"`,
      v.reporterRole,
      v.followUpStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Pelanggaran_SMPN1_Pontianak_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Buku Catatan Pelanggaran Siswa
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Sistem Poin Tata Tertib Terpadu</span>
            <span aria-hidden="true">·</span>
            <span>SMP Negeri 1 Kota Pontianak</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Rekap (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Pelanggaran Baru
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa, kelas, uraian..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Tingkat / Kelas</option>
              <optgroup label="Kelas VII">
                <option value="VII-A">Kelas VII-A</option>
                <option value="VII-B">Kelas VII-B</option>
                <option value="VII-C">Kelas VII-C</option>
                <option value="VII-D">Kelas VII-D</option>
              </optgroup>
              <optgroup label="Kelas VIII">
                <option value="VIII-A">Kelas VIII-A</option>
                <option value="VIII-B">Kelas VIII-B</option>
                <option value="VIII-C">Kelas VIII-C</option>
                <option value="VIII-D">Kelas VIII-D</option>
              </optgroup>
              <optgroup label="Kelas IX">
                <option value="IX-A">Kelas IX-A</option>
                <option value="IX-B">Kelas IX-B</option>
                <option value="IX-C">Kelas IX-C</option>
                <option value="IX-D">Kelas IX-D</option>
              </optgroup>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori Pelanggaran</option>
              <option value="Kedisiplinan & Waktu">Kedisiplinan & Waktu</option>
              <option value="Kerapian & Atribut Seragam">Kerapian & Atribut Seragam</option>
              <option value="KBM & Sikap Akademik">KBM & Sikap Akademik</option>
              <option value="Etika & Sopan Santun">Etika & Sopan Santun</option>
              <option value="Pelanggaran Berat & Ketertiban">Pelanggaran Berat & Ketertiban</option>
            </select>
          </div>

          {/* Follow-up Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status Penanganan</option>
              <option value="Baru">Baru Tercatat</option>
              <option value="Konseling BK">Sedang Konseling BK</option>
              <option value="Panggilan Ortu">Proses Panggilan Ortu</option>
              <option value="Selesai Terbina">Selesai / Terbina</option>
            </select>
          </div>
        </div>

        {/* Active counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Menampilkan <strong className="text-slate-800 tabular-nums">{filteredViolations.length}</strong> catatan dari total {violations.length}</span>
          {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedClass !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedClass('all');
              }}
              className="text-blue-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Waktu & Tempat</th>
                <th className="py-3 px-3.5">Nama Siswa / Kelas</th>
                <th className="py-3 px-3.5">Kategori & Kejadian</th>
                <th className="py-3 px-3.5 text-center">Poin</th>
                <th className="py-3 px-3.5">Pelapor</th>
                <th className="py-3 px-3.5">Status Penanganan</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada catatan pelanggaran yang cocok</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter</p>
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => {
                  const student = students.find(s => s.id === v.studentId);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900 font-mono">{v.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {v.time} WIB
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {v.location}
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => student && onSelectStudent(student)}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline text-left block"
                        >
                          {v.studentName}
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700">{v.classGrade}</span>
                          {student && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono text-slate-500">{student.nisn}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Violation details */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="font-semibold text-slate-800">{v.category}</div>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                          {v.description}
                        </p>
                        {v.immediateAction && (
                          <div className="text-[10px] text-slate-500 mt-1 italic">
                            Tindakan: {v.immediateAction}
                          </div>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          v.points >= 40 
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : v.points >= 20
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          +{v.points}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{v.reporterName}</div>
                        <div className="text-[11px] text-slate-500">{v.reporterRole}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          v.followUpStatus === 'Selesai Terbina'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.followUpStatus === 'Panggilan Ortu'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : v.followUpStatus === 'Konseling BK'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {v.followUpStatus === 'Selesai Terbina' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {v.followUpStatus === 'Panggilan Ortu' && <FileText className="w-3 h-3 text-indigo-600" />}
                          {v.followUpStatus === 'Konseling BK' && <Clock className="w-3 h-3 text-amber-600" />}
                          {v.followUpStatus}
                        </span>
                        {v.followUpNotes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px] mt-0.5">
                            {v.followUpNotes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View / Edit detail */}
                          <button
                            onClick={() => setDetailViolation(v)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Ubah Status / Catatan Tindak Lanjut"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Quick summon action if points or serious */}
                          {student && student.totalPoints >= 25 && (
                            <button
                              onClick={() => onCreateSummonsForStudent(student, [v.id])}
                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                              title="Terbitkan Surat Panggilan Orang Tua untuk Siswa Ini"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan pelanggaran untuk ${v.studentName}?`)) {
                                onDeleteViolation(v.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Rekaman"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Catat Pelanggaran Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulir Pencatatan Pelanggaran Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  SMP Negeri 1 Kota Pontianak · Pedoman Tata Tertib & Poin
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              
              {/* Row: Student Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Siswa yang Melanggar <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  <option value="">-- Pilih Siswa dari Daftar --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.classGrade}) - Poin Sekarang: {s.totalPoints} pts
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Points Impact Preview */}
              {currentStudent && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-blue-900">{currentStudent.name}</span>
                    <span className="text-blue-700"> ({currentStudent.classGrade} · NISN: {currentStudent.nisn})</span>
                    <div className="text-[11px] text-blue-800 mt-0.5">
                      Poin Lama: <strong className="font-mono">{currentStudent.totalPoints}</strong> + Poin Baru: <strong className="font-mono">+{customPoints}</strong> = Total Baru: <strong className="font-mono text-red-700">{currentStudent.totalPoints + Number(customPoints)} Poin</strong>
                    </div>
                  </div>

                  {currentStudent.totalPoints + Number(customPoints) >= 50 && (
                    <div className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Wajib Panggilan Ortu!
                    </div>
                  )}
                </div>
              )}

              {/* Catalog selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih dari Katalog Pelanggaran Resmi (Otomatis terisi bobot poin)
                </label>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => handleCatalogSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Pilih Jenis Pelanggaran dari Katalog Standar --</option>
                  {catalog.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.code}] ({cat.points} Poin) {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Points row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Pelanggaran
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as ViolationCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Kedisiplinan & Waktu">Kedisiplinan & Waktu</option>
                    <option value="Kerapian & Atribut Seragam">Kerapian & Atribut Seragam</option>
                    <option value="KBM & Sikap Akademik">KBM & Sikap Akademik</option>
                    <option value="Etika & Sopan Santun">Etika & Sopan Santun</option>
                    <option value="Pelanggaran Berat & Ketertiban">Pelanggaran Berat & Ketertiban</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bobot Poin Pelanggaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customPoints}
                    onChange={(e) => setCustomPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Kejadian / Kronologi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Jelaskan detail perbuatan atau situasi saat pelanggaran terjadi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Date, Time, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pukul (WIB)
                  </label>
                  <input
                    type="time"
                    value={violationTime}
                    onChange={(e) => setViolationTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Kejadian
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Gerbang Depan / Kelas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Guru / Petugas Pelapor
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran Pelapor
                  </label>
                  <select
                    value={reporterRole}
                    onChange={(e) => setReporterRole(e.target.value as ViolationRecord['reporterRole'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Guru Piket">Guru Piket</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Waka Kesiswaan">Waka Kesiswaan</option>
                  </select>
                </div>
              </div>

              {/* Immediate action & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tindakan Langsung Saat Kejadian
                  </label>
                  <input
                    type="text"
                    value={immediateAction}
                    onChange={(e) => setImmediateAction(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Tindak Lanjut Awal
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Baru">Baru Tercatat</option>
                    <option value="Konseling BK">Langsung Jadwalkan Konseling BK</option>
                    <option value="Panggilan Ortu">Proses Surat Panggilan Orang Tua</option>
                    <option value="Selesai Terbina">Selesai Terbina Langsung di Tempat</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  Simpan Catatan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Detail & Update Status Penanganan */}
      {detailViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Penanganan Pelanggaran
                </h3>
                <p className="text-xs text-slate-500">
                  ID: {detailViolation.id} · {detailViolation.studentName} ({detailViolation.classGrade})
                </p>
              </div>
              <button
                onClick={() => setDetailViolation(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span>{detailViolation.date} {detailViolation.time} WIB</span>
                  <span className="font-bold text-red-600 font-mono">+{detailViolation.points} Poin</span>
                </div>
                <div className="font-semibold text-slate-800">{detailViolation.category}</div>
                <p className="text-slate-600 mt-1">{detailViolation.description}</p>
                <div className="mt-2 text-[11px] text-slate-500">
                  Pelapor: {detailViolation.reporterName} ({detailViolation.reporterRole})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perbarui Status Tindak Lanjut
                </label>
                <select
                  value={detailViolation.followUpStatus}
                  onChange={(e) => setDetailViolation({
                    ...detailViolation,
                    followUpStatus: e.target.value as FollowUpStatus
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Baru">Baru Tercatat</option>
                  <option value="Konseling BK">Sedang Bimbingan Konseling (BK)</option>
                  <option value="Panggilan Ortu">Proses Pemanggilan Orang Tua</option>
                  <option value="Selesai Terbina">Selesai Terbina (Surat Pernyataan Ditandatangani)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Progres Konseling / Penanganan BK
                </label>
                <textarea
                  rows={3}
                  value={detailViolation.followUpNotes || ''}
                  onChange={(e) => setDetailViolation({
                    ...detailViolation,
                    followUpNotes: e.target.value
                  })}
                  placeholder="Tuliskan perkembangan bimbingan, komitmen perubahan sikap, atau hasil temu..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDetailViolation(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateViolation({
                      ...detailViolation,
                      handledDate: new Date().toISOString().split('T')[0]
                    });
                    setDetailViolation(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Perubahan Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
