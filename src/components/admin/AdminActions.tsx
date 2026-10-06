"use client";

import { CheckCircle, XCircle } from "lucide-react";

export function AdminReportActions({ reportId }: { reportId: string }) {
  const handleResolve = () => {
    alert(`Đã xử lý báo cáo ${reportId}: Gỡ nội dung vi phạm và gửi cảnh cáo.`);
  };

  const handleDismiss = () => {
    alert(`Đã bỏ qua báo cáo ${reportId}.`);
  };

  return (
    <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
      <button
        type="button"
        onClick={handleResolve}
        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-950/40 border border-red-800/40 py-2 text-xs font-semibold text-red-300 active:scale-95"
      >
        <XCircle className="h-3.5 w-3.5" />
        <span>Xóa & Cảnh cáo</span>
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-surface-elevated border border-border-subtle py-2 text-xs font-semibold text-ink-primary active:scale-95"
      >
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        <span>Bỏ qua</span>
      </button>
    </div>
  );
}
