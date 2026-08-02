import React, { useState } from 'react';
import { Upload, Calendar, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Sparkles, FileText } from 'lucide-react';
import { parseExcelOrCsvBuffer, processAndSaveSnapshot, downloadSampleExcelTemplate } from '../utils/excelParser';
import { RawParticipantRow } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: (snapshotDate: string, summary: { newParticipantsCount: number; totalCombined: number }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}) => {
  const [snapshotDate, setSnapshotDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RawParticipantRow[] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setErrorMessage('Format file tidak didukung. Harap upload file .xlsx, .xls, atau .csv!');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const rows = parseExcelOrCsvBuffer(buffer);
        if (rows.length === 0) {
          setErrorMessage('File kosong atau format kolom tidak sesuai!');
          setParsedRows(null);
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setErrorMessage('Gagal membaca file: ' + (err.message || 'Error parsing'));
        setParsedRows(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedRows || parsedRows.length === 0) {
      setErrorMessage('Silakan upload file CSV/XLSX terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await processAndSaveSnapshot(projectId, snapshotDate, parsedRows);
      setIsProcessing(false);
      onSuccess(snapshotDate, result);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage('Gagal menyimpan snapshot ke IndexedDB: ' + (err.message || 'Error DB'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 relative my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              Upload Data Harian Facilitator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload file CSV/XLSX laporan Google Arcade untuk diproses & dianalisis secara otomatis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Download Template Banner */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Belum Punya Format File Laporan?</p>
              <p className="text-[11px] text-blue-700">Download sampel/template Excel resmi dengan header kolom standar.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Template
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Snapshot Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Tanggal Snapshot Laporan
            </label>
            <input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *Mendukung backdate jika Anda ingin memasukkan laporan tanggal sebelumnya.
            </p>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              File CSV atau Excel (.xlsx)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
              }`}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-extrabold text-emerald-700">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Tarik & Lepas File di Sini, atau <span className="text-blue-600 underline">Pilih File</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Mendukung format .xlsx, .xls, atau .csv</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Summary Preview */}
          {parsedRows && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Berhasil Membaca File: {parsedRows.length} Peserta Terdeteksi</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                <div>
                  • Total Row: <strong className="text-slate-800">{parsedRows.length}</strong>
                </div>
                <div>
                  • Tanggal Target: <strong className="text-slate-800">{snapshotDate}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!parsedRows || isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses Snapshot...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simpan & Analisis Snapshot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
