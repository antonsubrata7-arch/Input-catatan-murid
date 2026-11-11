import React, { useState } from 'react';
import { ParentSummons, SchoolProfile, ViolationRecord } from '../types';
import { 
  Printer, 
  Send, 
  FileCheck2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  UserCheck, 
  AlertCircle
} from 'lucide-react';

interface OfficialLetterPreviewProps {
  summons: ParentSummons;
  schoolProfile: SchoolProfile;
  relatedViolations: ViolationRecord[];
  onBack: () => void;
  onUpdateSummons: (updated: ParentSummons) => void;
}

export const OfficialLetterPreview: React.FC<OfficialLetterPreviewProps> = ({
  summons,
  schoolProfile,
  relatedViolations,
  onBack,
  onUpdateSummons,
}) => {
  const [copiedWA, setCopiedWA] = useState(false);
  const [isBAPModalOpen, setIsBAPModalOpen] = useState(false);
  
  // BAP form state
  const [bapNotes, setBapNotes] = useState(summons.bapNotes || '');
  const [studentCommitment, setStudentCommitment] = useState(summons.studentCommitment || '');
  const [parentAgreement, setParentAgreement] = useState(summons.parentAgreement || '');
  const [bapStatus, setBapStatus] = useState<ParentSummons['status']>(summons.status);

  // Format date in Indonesian locale (e.g., "12 November 2026")
  const formatIndoDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // WhatsApp formal invitation message generator
  const getWhatsAppMessage = () => {
    return `*SURAT PANGGILAN ORANG TUA / WALI SISWA*\n*SMP NEGERI 1 KOTA PONTIANAK*\n\n` +
      `Kepada Yth. *${summons.parentName}*,\n` +
      `Orang Tua / Wali dari siswa:\n` +
      `• *Nama*: ${summons.studentName}\n` +
      `• *Kelas*: ${summons.classGrade}\n` +
      `• *NISN*: ${summons.nisn}\n\n` +
      `Sehubungan dengan pembinaan kedisiplinan dan tata tertib ananda di sekolah (No. Surat: ${summons.letterNumber}), kami mengundang Bapak/Ibu untuk hadir pada:\n\n` +
      `📅 *Hari/Tanggal*: ${formatIndoDate(summons.scheduledDate)}\n` +
      `⏰ *Pukul*: ${summons.scheduledTime}\n` +
      `📍 *Tempat*: ${summons.locationRoom}\n` +
      `👥 *Menghadap*: Guru BK (${summons.counselorTeacher}) & Wali Kelas (${summons.homeroomTeacher})\n\n` +
      `Mengingat pentingnya koordinasi demi masa depan pendidikan ananda tercinta, kehadiran Bapak/Ibu sangat kami harapkan tepat waktu.\n\n` +
      `Hormat kami,\n` +
      `*Unit Bimbingan Konseling (BK)*\n` +
      `*SMP Negeri 1 Kota Pontianak*\n` +
      `Telp: ${schoolProfile.phone}`;
  };

  const handleCopyWA = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handleSendWA = () => {
    const cleanPhone = summons.parentPhone.replace(/[^0-9]/g, '');
    let intlPhone = cleanPhone;
    if (intlPhone.startsWith('0')) {
      intlPhone = '62' + intlPhone.slice(1);
    }
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(getWhatsAppMessage())}`;
    window.open(url, '_blank');
  };

  const handleSaveBAP = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSummons({
      ...summons,
      status: bapStatus,
      attendanceDate: bapStatus === 'Hadir - BAP Selesai' ? new Date().toISOString().split('T')[0] : summons.attendanceDate,
      bapNotes,
      studentCommitment,
      parentAgreement,
    });
    setIsBAPModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header (No print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Panggilan
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy WA Message */}
          <button
            onClick={handleCopyWA}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Salin draf undangan WhatsApp untuk orang tua"
          >
            {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedWA ? 'Tersalin!' : 'Salin Teks WA'}
          </button>

          {/* Direct WA button */}
          <button
            onClick={handleSendWA}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Kirim WhatsApp Ortu
          </button>

          {/* BAP Outcome Button */}
          <button
            onClick={() => setIsBAPModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Catat Hasil Temu / BAP
          </button>

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Surat (A4)
          </button>
        </div>
      </div>

      {/* Status banner in Web view */}
      <div className="no-print bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Status Pemanggilan:</span>
          <span className={`px-2.5 py-0.5 rounded font-semibold ${
            summons.status === 'Hadir - BAP Selesai'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : summons.status === 'Dijadwalkan'
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {summons.status}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">Tahap: <strong>{summons.summonsStage}</strong></span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">Total Poin: <strong className="text-red-600 font-mono">{summons.accumulatedPointsAtCall} Poin</strong></span>
        </div>

        {summons.attendanceDate && (
          <div className="text-slate-600">
            Dihadiri pada: <strong>{formatIndoDate(summons.attendanceDate)}</strong>
          </div>
        )}
      </div>

      {/* Printable Sheet (Simulating real Indonesian School Official Document) */}
      <div className="print-only-container bg-white border border-slate-300 shadow-md max-w-4xl mx-auto p-8 sm:p-12 text-slate-900 font-serif leading-relaxed text-sm">
        
        {/* KOP SURAT RESMI DINAS PENDIDIKAN KOTA PONTIANAK */}
        <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Kemdikbud / Lambang Daerah */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full text-blue-900" fill="currentColor">
                <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="4"/>
                <path d="M50 15 L78 35 L70 75 L50 85 L30 75 L22 35 Z" fill="#1e3a8a" opacity="0.15"/>
                <path d="M50 22 L65 55 L35 55 Z" fill="#1e3a8a"/>
                <circle cx="50" cy="40" r="8" fill="#f59e0b"/>
                <rect x="38" y="58" width="24" height="6" rx="2" fill="#1e3a8a"/>
                <path d="M42 66 L58 66 L50 78 Z" fill="#dc2626"/>
              </svg>
            </div>

            {/* Header Text */}
            <div className="flex-1 text-center font-sans">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-800">
                Pemerintah Kota Pontianak
              </h4>
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">
                Dinas Pendidikan dan Kebudayaan
              </h3>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-wide uppercase text-blue-950 mt-0.5">
                SMP Negeri 1 Kota Pontianak
              </h1>
              <p className="text-[11px] text-slate-600 mt-0.5 font-normal">
                NPSN: {schoolProfile.npsn} | Status Akreditasi: {schoolProfile.accreditation}
              </p>
              <p className="text-[11px] text-slate-600 font-normal">
                {schoolProfile.address}, {schoolProfile.city} {schoolProfile.postalCode}
              </p>
              <p className="text-[10px] text-slate-500 font-normal">
                Telp. {schoolProfile.phone} | Pos-el: {schoolProfile.email} | Laman: {schoolProfile.website}
              </p>
            </div>

            {/* School Emblem Placeholder */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
              <div className="w-18 h-18 rounded-full border-2 border-amber-600 flex flex-col items-center justify-center text-center p-1 bg-amber-50">
                <span className="text-[9px] font-extrabold text-blue-950 leading-tight">SMPN 1</span>
                <span className="text-[8px] font-bold text-amber-700 leading-tight">PONTIANAK</span>
                <span className="text-[7px] text-slate-500 leading-none mt-0.5">EST. 1951</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nomor Surat & Tanggal */}
        <div className="flex justify-between items-start font-sans text-xs mb-6">
          <div className="space-y-1">
            <div className="grid grid-cols-[80px_10px_auto]">
              <span>Nomor</span>
              <span>:</span>
              <span className="font-semibold font-mono">{summons.letterNumber}</span>
            </div>
            <div className="grid grid-cols-[80px_10px_auto]">
              <span>Lampiran</span>
              <span>:</span>
              <span>1 (satu) Berkas Rekapitulasi</span>
            </div>
            <div className="grid grid-cols-[80px_10px_auto]">
              <span>Perihal</span>
              <span>:</span>
              <span className="font-bold underline">
                Panggilan Orang Tua / Wali Siswa ({summons.summonsStage})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span>Pontianak, {formatIndoDate(new Date().toISOString().split('T')[0])}</span>
          </div>
        </div>

        {/* Kepada Tujuan */}
        <div className="font-sans text-xs mb-6">
          <p>Kepada Yth.</p>
          <p className="font-bold">Bapak / Ibu Orang Tua / Wali dari:</p>
          <p className="font-semibold text-slate-800">{summons.studentName}</p>
          <p className="text-slate-600">di Tempat</p>
        </div>

        {/* Isi Surat */}
        <div className="space-y-4 text-justify font-sans text-xs leading-relaxed">
          <p>Dengan hormat,</p>
          <p>
            Sehubungan dengan pelaksanaan tata tertib dan pembinaan kedisiplinan siswa di lingkungan 
            SMP Negeri 1 Kota Pontianak, serta berdasarkan rekapitulasi poin pelanggaran ananda 
            yang telah mencapai akumulasi <strong className="font-mono text-red-700">{summons.accumulatedPointsAtCall} Poin</strong> ({summons.summonsStage}), 
            maka demi kelancaran dan perbaikan proses belajar mengajar putra/putri Bapak/Ibu, 
            dengan ini kami mengharapkan kehadiran Bapak/Ibu orang tua/wali murid pada:
          </p>

          {/* Agenda Box */}
          <div className="my-3 p-4 bg-slate-50 border border-slate-300 rounded-sm space-y-2">
            <div className="grid grid-cols-[130px_15px_auto]">
              <span className="font-medium">Hari / Tanggal</span>
              <span>:</span>
              <span className="font-bold">{formatIndoDate(summons.scheduledDate)}</span>
            </div>
            <div className="grid grid-cols-[130px_15px_auto]">
              <span className="font-medium">Waktu</span>
              <span>:</span>
              <span className="font-bold font-mono">{summons.scheduledTime}</span>
            </div>
            <div className="grid grid-cols-[130px_15px_auto]">
              <span className="font-medium">Tempat</span>
              <span>:</span>
              <span>{summons.locationRoom}</span>
            </div>
            <div className="grid grid-cols-[130px_15px_auto]">
              <span className="font-medium">Menghadap</span>
              <span>:</span>
              <span className="font-medium">
                1. Guru Bimbingan Konseling ({summons.counselorTeacher})<br />
                2. Wali Kelas {summons.classGrade} ({summons.homeroomTeacher})
              </span>
            </div>
            <div className="grid grid-cols-[130px_15px_auto]">
              <span className="font-medium">Keperluan</span>
              <span>:</span>
              <span className="italic">{summons.reasonSummary}</span>
            </div>
          </div>

          <p>
            Mengingat sangat pentingnya koordinasi bersama antara pihak sekolah dan orang tua 
            guna membentuk budi pekerti serta masa depan peserta didik, kami sangat mengharapkan 
            kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan (tidak diwakilkan).
          </p>

          <p>
            Demikian surat panggilan ini kami sampaikan. Atas perhatian, kerja sama, dan kehadiran 
            Bapak/Ibu, kami ucapkan terima kasih.
          </p>
        </div>

        {/* Tanda Tangan Pejabat Sekolah */}
        <div className="mt-10 grid grid-cols-2 gap-8 font-sans text-xs pt-4">
          <div className="text-center">
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-semibold text-slate-800">Kepala SMP Negeri 1 Kota Pontianak</p>
            
            {/* Signature spacing */}
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Stempel Resmi]</span>
            </div>
            
            <p className="font-bold underline text-slate-900">{summons.principalName}</p>
            <p className="text-[11px] font-mono text-slate-700">NIP. {summons.principalNIP}</p>
          </div>

          <div className="text-center">
            <p className="text-slate-600">&nbsp;</p>
            <p className="font-semibold text-slate-800">Guru Bimbingan Konseling (BK)</p>
            
            {/* Signature spacing */}
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
            </div>
            
            <p className="font-bold underline text-slate-900">{summons.counselorTeacher}</p>
            <p className="text-[11px] font-mono text-slate-700">NIP. {schoolProfile.bkCoordinatorNIP}</p>
          </div>
        </div>

        {/* Tembusan */}
        <div className="mt-8 pt-4 border-t border-slate-200 font-sans text-[10px] text-slate-500">
          <p className="font-bold">Tembusan Kepada Yth:</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-1">
            <li>Wakil Kepala Sekolah Bidang Kesiswaan ({schoolProfile.vicePrincipalStudentAffairs})</li>
            <li>Wali Kelas {summons.classGrade} ({summons.homeroomTeacher})</li>
            <li>Arsip / Dokumen Bimbingan Konseling (BK)</li>
          </ol>
        </div>

        {/* Rincian Pelanggaran Terkait (Lampiran) */}
        {relatedViolations.length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-300 font-sans text-xs">
            <div className="mb-3">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Lampiran: Rekapitulasi Pelanggaran yang Mendasari Pemanggilan
              </span>
              <p className="text-[11px] text-slate-500">
                Nama Siswa: {summons.studentName} | NISN: {summons.nisn} | Kelas: {summons.classGrade}
              </p>
            </div>

            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="p-2 border-r border-slate-300 w-24">Tanggal</th>
                  <th className="p-2 border-r border-slate-300">Uraian Pelanggaran</th>
                  <th className="p-2 border-r border-slate-300 w-32">Lokasi Kejadian</th>
                  <th className="p-2 border-r border-slate-300 w-24">Pelapor</th>
                  <th className="p-2 text-right w-16">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {relatedViolations.map((v, i) => (
                  <tr key={v.id}>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">{i + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{v.date}</td>
                    <td className="p-2 border-r border-slate-300">
                      <span className="font-semibold text-slate-800">{v.category}</span>
                      <p className="text-[10px] text-slate-600">{v.description}</p>
                    </td>
                    <td className="p-2 border-r border-slate-300">{v.location}</td>
                    <td className="p-2 border-r border-slate-300">{v.reporterName}</td>
                    <td className="p-2 text-right font-mono font-bold text-red-600">+{v.points}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td colSpan={5} className="p-2 text-right border-r border-slate-300">Total Poin Akumulatif:</td>
                  <td className="p-2 text-right font-mono text-red-700">
                    {relatedViolations.reduce((sum, v) => sum + v.points, 0)} Pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Keratan Tanda Terima / Bukti Kehadiran Orang Tua */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-400 font-sans text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 italic mb-2">
            <span>--- (Gunting/potong di sini sebagai bukti tanda terima sekolah) ---</span>
            <span>LEMBAR KONFIRMASI KEHADIRAN ORANG TUA</span>
          </div>
          <div className="p-3 border border-slate-200 bg-slate-50 space-y-2 text-[11px]">
            <p>
              Saya yang bertanda tangan di bawah ini, Orang Tua / Wali dari siswa <strong>{summons.studentName}</strong> (Kelas {summons.classGrade}), 
              menyatakan telah menerima Surat Panggilan No: <strong>{summons.letterNumber}</strong> dan bersedia hadir memenuhi undangan sekolah.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div>
                <p>Catatan dari Orang Tua / Wali:</p>
                <div className="h-10 border-b border-dotted border-slate-400"></div>
              </div>
              <div className="text-right">
                <p>Pontianak, .................................... 2026</p>
                <p className="mt-6 underline font-semibold">( .............................................................. )</p>
                <p className="text-[10px] text-slate-500">Tanda Tangan & Nama Terang Orang Tua / Wali</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal BAP (Berita Acara Pembinaan) */}
      {isBAPModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulir Berita Acara Pertemuan & Perjanjian (BAP)
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan hasil mediasi orang tua, siswa, dan konselor BK
                </p>
              </div>
              <button
                onClick={() => setIsBAPModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveBAP} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Kehadiran Pertemuan
                </label>
                <select
                  value={bapStatus}
                  onChange={(e) => setBapStatus(e.target.value as ParentSummons['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Dijadwalkan">Dijadwalkan (Belum Hadir)</option>
                  <option value="Hadir - BAP Selesai">Hadir - BAP Selesai & Surat Perjanjian Ditandatangani</option>
                  <option value="Tidak Hadir">Tidak Hadir (Perlu Panggilan Ulang / Home Visit)</option>
                  <option value="Dibatalkan">Dibatalkan / Selesai Lewat Jalur Lain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Hasil Konseling / Kesepakatan di Ruang BK
                </label>
                <textarea
                  rows={3}
                  value={bapNotes}
                  onChange={(e) => setBapNotes(e.target.value)}
                  placeholder="Contoh: Orang tua hadir tepat waktu. Dilakukan musyawarah perihal kedisiplinan siswa..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Komitmen / Pernyataan Siswa (Surat Janji Siswa)
                </label>
                <textarea
                  rows={2}
                  value={studentCommitment}
                  onChange={(e) => setStudentCommitment(e.target.value)}
                  placeholder="Contoh: Saya berjanji tidak akan mengulangi perbuatan tersebut dan bersedia diproses skorsing jika melanggar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bentuk Dukungan & Pengawasan Orang Tua di Rumah
                </label>
                <textarea
                  rows={2}
                  value={parentAgreement}
                  onChange={(e) => setParentAgreement(e.target.value)}
                  placeholder="Contoh: Orang tua akan memantau waktu tidur malam dan membatasi jam keluar malam..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBAPModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Berita Acara (BAP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
