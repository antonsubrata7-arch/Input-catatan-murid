import React, { useState, useEffect } from 'react';
import { 
  Student, 
  ViolationRecord, 
  ParentSummons, 
  SchoolProfile, 
  ClassGrade 
} from './types';
import { 
  SCHOOL_PROFILE, 
  VIOLATION_CATALOG, 
  INITIAL_STUDENTS, 
  INITIAL_VIOLATIONS, 
  INITIAL_SUMMONS,
  getDisciplineStatus
} from './data/mockData';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ViolationManagement } from './components/ViolationManagement';
import { ParentSummonsManagement } from './components/ParentSummonsManagement';
import { OfficialLetterPreview } from './components/OfficialLetterPreview';
import { StudentRoster } from './components/StudentRoster';
import { AIAssistantModal } from './components/AIAssistantModal';
import { 
  BarChart3, 
  AlertTriangle, 
  Mail, 
  Users, 
  BookOpen, 
  Plus, 
  Printer, 
  School,
  Search,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'violations' | 'summons' | 'students' | 'catalog' | 'letter-preview'>('analytics');
  
  // Persistent or stateful dataset
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smpn1_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    const saved = localStorage.getItem('smpn1_violations');
    return saved ? JSON.parse(saved) : INITIAL_VIOLATIONS;
  });

  const [summonsList, setSummonsList] = useState<ParentSummons[]>(() => {
    const saved = localStorage.getItem('smpn1_summons');
    return saved ? JSON.parse(saved) : INITIAL_SUMMONS;
  });

  // Selected letter for full-screen inspection & printing
  const [activeLetter, setActiveLetter] = useState<ParentSummons | null>(null);

  // Selected student passed into Summons creation modal
  const [studentForSummons, setStudentForSummons] = useState<Student | null>(null);

  // Selected student for AI Counselor modal
  const [aiCounselorStudent, setAiCounselorStudent] = useState<Student | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('smpn1_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smpn1_violations', JSON.stringify(violations));
  }, [violations]);

  useEffect(() => {
    localStorage.setItem('smpn1_summons', JSON.stringify(summonsList));
  }, [summonsList]);

  // Recalculate student total points whenever violations change
  const refreshStudentPoints = (updatedViolations: ViolationRecord[]) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        const studentViolations = updatedViolations.filter(v => v.studentId === student.id);
        const calculatedPoints = studentViolations.reduce((sum, v) => sum + v.points, 0);
        return {
          ...student,
          totalPoints: calculatedPoints,
          disciplineStatus: getDisciplineStatus(calculatedPoints),
        };
      });
    });
  };

  // Add violation handler
  const handleAddViolation = (newRecord: Omit<ViolationRecord, 'id'>) => {
    const newId = `REC-2026-${String(violations.length + 1).padStart(3, '0')}`;
    const record: ViolationRecord = {
      ...newRecord,
      id: newId,
    };
    const updated = [record, ...violations];
    setViolations(updated);
    refreshStudentPoints(updated);
  };

  // Update violation
  const handleUpdateViolation = (updatedRecord: ViolationRecord) => {
    const updated = violations.map(v => v.id === updatedRecord.id ? updatedRecord : v);
    setViolations(updated);
    refreshStudentPoints(updated);
  };

  // Delete violation
  const handleDeleteViolation = (id: string) => {
    const updated = violations.filter(v => v.id !== id);
    setViolations(updated);
    refreshStudentPoints(updated);
  };

  // Add summons handler
  const handleCreateSummons = (newSummons: Omit<ParentSummons, 'id'>) => {
    const newId = `SUM-2026-${String(summonsList.length + 1).padStart(3, '0')}`;
    const summonsItem: ParentSummons = {
      ...newSummons,
      id: newId,
    };
    setSummonsList([summonsItem, ...summonsList]);

    // Also update student's violations to status 'Panggilan Ortu'
    const updatedViolations = violations.map(v => {
      if (newSummons.violationRecordIds.includes(v.id)) {
        return { ...v, followUpStatus: 'Panggilan Ortu' as const };
      }
      return v;
    });
    setViolations(updatedViolations);

    // Switch to letter preview immediately
    setActiveLetter(summonsItem);
    setActiveTab('letter-preview');
  };

  // Update summons (e.g. from BAP dialog)
  const handleUpdateSummons = (updated: ParentSummons) => {
    setSummonsList(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (activeLetter?.id === updated.id) {
      setActiveLetter(updated);
    }

    // If BAP was marked complete, update related violations to 'Selesai Terbina'
    if (updated.status === 'Hadir - BAP Selesai') {
      const updatedViolations = violations.map(v => {
        if (updated.violationRecordIds.includes(v.id)) {
          return {
            ...v,
            followUpStatus: 'Selesai Terbina' as const,
            followUpNotes: `Tuntas dalam BAP No. ${updated.letterNumber}`,
          };
        }
        return v;
      });
      setViolations(updatedViolations);
    }
  };

  // Delete summons
  const handleDeleteSummons = (id: string) => {
    setSummonsList(prev => prev.filter(s => s.id !== id));
    if (activeLetter?.id === id) {
      setActiveLetter(null);
      setActiveTab('summons');
    }
  };

  // Direct reduction of points for achievement/behavior improvement
  const handleReducePoints = (studentId: string, amount: number, reason: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newPoints = Math.max(0, s.totalPoints - amount);
        return {
          ...s,
          totalPoints: newPoints,
          disciplineStatus: getDisciplineStatus(newPoints),
          notes: `${s.notes ? s.notes + '; ' : ''}Pemutihan ${amount} poin: ${reason}`,
        };
      }
      return s;
    }));
  };

  // Navigation shortcut: view letter
  const handleViewLetter = (summons: ParentSummons) => {
    setActiveLetter(summons);
    setActiveTab('letter-preview');
  };

  // Navigation shortcut: summon for student
  const handleOpenSummonsForStudent = (student: Student) => {
    setStudentForSummons(student);
    setActiveTab('summons');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar - strictly follows 3-zone contract */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element Brand wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('analytics');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-blue-950 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
              S1
            </div>
            <span>SIPEMURID SMPN 1 Pontianak</span>
          </a>

          {/* Zone 2: 4-5 clean single-line nav links with hover underlines */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'analytics' ? 'text-blue-900 border-b-2 border-blue-900' : ''
              }`}
            >
              Grafik & Statistik
            </button>
            <button
              onClick={() => setActiveTab('violations')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'violations' ? 'text-blue-900 border-b-2 border-blue-900' : ''
              }`}
            >
              Catatan Pelanggaran
            </button>
            <button
              onClick={() => setActiveTab('summons')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'summons' || activeTab === 'letter-preview' ? 'text-blue-900 border-b-2 border-blue-900' : ''
              }`}
            >
              Panggilan Orang Tua
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'students' ? 'text-blue-900 border-b-2 border-blue-900' : ''
              }`}
            >
              Buku Induk Siswa
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'catalog' ? 'text-blue-900 border-b-2 border-blue-900' : ''
              }`}
            >
              Katalog Tata Tertib
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('violations')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Pelanggaran</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-900' : 'text-slate-600'
            }`}
          >
            Grafik
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'violations' ? 'bg-blue-50 text-blue-900' : 'text-slate-600'
            }`}
          >
            Pelanggaran
          </button>
          <button
            onClick={() => setActiveTab('summons')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'summons' || activeTab === 'letter-preview' ? 'bg-blue-50 text-blue-900' : 'text-slate-600'
            }`}
          >
            Panggilan Ortu
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'students' ? 'bg-blue-50 text-blue-900' : 'text-slate-600'
            }`}
          >
            Buku Induk
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-blue-50 text-blue-900' : 'text-slate-600'
            }`}
          >
            Katalog
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Analytics & Charts */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts
            violations={violations}
            summons={summonsList}
            students={students}
            onSelectStudent={(student) => {
              setStudentForSummons(student);
              setActiveTab('students');
            }}
            onNavigateToSummons={() => setActiveTab('summons')}
          />
        )}

        {/* Tab 2: Violations Records */}
        {activeTab === 'violations' && (
          <ViolationManagement
            violations={violations}
            students={students}
            catalog={VIOLATION_CATALOG}
            onAddViolation={handleAddViolation}
            onUpdateViolation={handleUpdateViolation}
            onDeleteViolation={handleDeleteViolation}
            onCreateSummonsForStudent={(student, relIds) => {
              setStudentForSummons(student);
              setActiveTab('summons');
            }}
            onSelectStudent={(student) => {
              setStudentForSummons(student);
              setActiveTab('students');
            }}
          />
        )}

        {/* Tab 3: Parent Summons List */}
        {activeTab === 'summons' && (
          <ParentSummonsManagement
            summonsList={summonsList}
            students={students}
            violations={violations}
            schoolProfile={SCHOOL_PROFILE}
            onCreateSummons={handleCreateSummons}
            onUpdateSummons={handleUpdateSummons}
            onDeleteSummons={handleDeleteSummons}
            onViewLetter={handleViewLetter}
            initialSelectedStudent={studentForSummons}
          />
        )}

        {/* Tab 4: Official Letter Print Preview */}
        {activeTab === 'letter-preview' && activeLetter && (
          <OfficialLetterPreview
            summons={activeLetter}
            schoolProfile={SCHOOL_PROFILE}
            relatedViolations={violations.filter(v => activeLetter.violationRecordIds.includes(v.id))}
            onBack={() => setActiveTab('summons')}
            onUpdateSummons={handleUpdateSummons}
          />
        )}

        {/* Tab 5: Students Master Roster */}
        {activeTab === 'students' && (
          <StudentRoster
            students={students}
            violations={violations}
            summonsList={summonsList}
            onSelectStudent={(st) => setStudentForSummons(st)}
            onOpenNewViolationForStudent={(st) => {
              setActiveTab('violations');
            }}
            onOpenNewSummonsForStudent={(st) => {
              setStudentForSummons(st);
              setActiveTab('summons');
            }}
            onReducePoints={handleReducePoints}
            onOpenAICounselor={(st) => setAiCounselorStudent(st)}
          />
        )}

        {/* Tab 6: Catalog & Bylaws Table */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Pedoman Bobot Poin & Sanksi Tata Tertib
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ketetapan Tata Tertib Peserta Didik SMP Negeri 1 Kota Pontianak
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-emerald-700">0 - 24 Poin</span>
                <h4 className="font-bold text-slate-900 mt-1">Peringatan Lisan</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pembinaan oleh Guru Piket & Wali Kelas dengan teguran mendidik dan tugas literasi/kebersihan.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-blue-700">25 - 49 Poin</span>
                <h4 className="font-bold text-slate-900 mt-1">Panggilan Ortu I</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Konseling intensif Guru BK dan penerbitan Surat Pemanggilan Orang Tua Tahap I.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-amber-700">50 - 74 Poin</span>
                <h4 className="font-bold text-slate-900 mt-1">Panggilan Ortu II</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Peringatan tertulis keras, pembuatan BAP Berita Acara Mediasi & perjanjian siswa bermaterai.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-red-700">&ge; 75 Poin</span>
                <h4 className="font-bold text-slate-900 mt-1">Skorsing / Konferensi Kasus</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Panggilan Tahap III, skorsing pembinaan belajar di rumah, sidang pleno dewan guru dan kepala sekolah.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3 w-20">Kode</th>
                    <th className="p-3 w-48">Kategori</th>
                    <th className="p-3">Nama / Jenis Pelanggaran</th>
                    <th className="p-3 w-24 text-center">Bobot</th>
                    <th className="p-3">Tindakan Pembinaan Standar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {VIOLATION_CATALOG.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-900">{cat.code}</td>
                      <td className="p-3 font-semibold text-slate-800">{cat.category}</td>
                      <td className="p-3 text-slate-700">{cat.name}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold ${
                          cat.points >= 40 ? 'bg-red-50 text-red-700' : cat.points >= 20 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          +{cat.points} Pts
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">{cat.defaultSanction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* AI Counselor Modal */}
      {aiCounselorStudent && (
        <AIAssistantModal
          student={aiCounselorStudent}
          violations={violations}
          schoolProfile={SCHOOL_PROFILE}
          onClose={() => setAiCounselorStudent(null)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 SMP Negeri 1 Kota Pontianak · Sistem Informasi Pelanggaran & Pemanggilan Murid (SIPEMURID)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Akreditasi A · NPSN 30105217 · Kalimantan Barat
          </span>
        </div>
      </footer>

    </div>
  );
}
