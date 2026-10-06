"use client";

import { X, Sun, Moon, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReaderSettings {
  theme: "dark" | "sepia" | "light";
  fontFamily: "reading" | "sans";
  fontSize: number; // in px: 14 to 26
  lineHeight: number; // 1.6, 1.85, 2.1
  wakeLock: boolean;
}

interface ReaderSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onChange: (newSettings: ReaderSettings) => void;
}

export function ReaderSettingsSheet({
  isOpen,
  onClose,
  settings,
  onChange,
}: ReaderSettingsSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg rounded-t-2xl border-t border-border-accent bg-surface p-5 shadow-2xl safe-pb animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-subtle" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="font-sans text-base font-semibold text-ink-primary">
            Cài đặt đọc truyện
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1. Theme Selector */}
        <div className="mt-4">
          <label className="text-xs font-medium text-ink-muted">Chế độ nền</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {/* Warm Dark */}
            <button
              onClick={() => onChange({ ...settings, theme: "dark" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                settings.theme === "dark"
                  ? "border-accent-gold bg-[#14110F] text-[#F2E8DC] ring-1 ring-accent-gold"
                  : "border-border-subtle bg-[#14110F] text-[#9D8C7C]"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Mộc Tối</span>
              {settings.theme === "dark" && <Check className="h-3 w-3 ml-1 text-accent-gold" />}
            </button>

            {/* Sepia */}
            <button
              onClick={() => onChange({ ...settings, theme: "sepia" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                settings.theme === "sepia"
                  ? "border-accent-gold bg-[#F4ECE1] text-[#2D2319] ring-1 ring-accent-gold"
                  : "border-border-subtle bg-[#F4ECE1] text-[#6E5F52]"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Giấy Cũ</span>
              {settings.theme === "sepia" && <Check className="h-3 w-3 ml-1 text-[#D39A5B]" />}
            </button>

            {/* Soft Light */}
            <button
              onClick={() => onChange({ ...settings, theme: "light" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                settings.theme === "light"
                  ? "border-accent-gold bg-[#FAF7F2] text-[#1C1714] ring-1 ring-accent-gold"
                  : "border-border-subtle bg-[#FAF7F2] text-[#7A6F68]"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Ban Ngày</span>
              {settings.theme === "light" && <Check className="h-3 w-3 ml-1 text-[#D39A5B]" />}
            </button>
          </div>
        </div>

        {/* 2. Font Family */}
        <div className="mt-4">
          <label className="text-xs font-medium text-ink-muted">Phông chữ hiển thị</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ ...settings, fontFamily: "sans" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                settings.fontFamily === "sans"
                  ? "border-accent-gold bg-surface-elevated text-accent-gold ring-1 ring-accent-gold"
                  : "border-border-subtle text-ink-secondary"
              )}
            >
              <span className="font-sans">UI Sans-serif</span>
              {settings.fontFamily === "sans" && <Check className="h-3 w-3 text-accent-gold" />}
            </button>

            <button
              onClick={() => onChange({ ...settings, fontFamily: "reading" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all",
                settings.fontFamily === "reading"
                  ? "border-accent-gold bg-surface-elevated text-accent-gold ring-1 ring-accent-gold"
                  : "border-border-subtle text-ink-secondary"
              )}
            >
              <span className="font-serif">Serif (Cổ điển)</span>
              {settings.fontFamily === "reading" && <Check className="h-3 w-3 text-accent-gold" />}
            </button>
          </div>
        </div>

        {/* 3. Font Size Slider */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
            <span>Cỡ chữ</span>
            <span className="font-semibold text-accent-gold">{settings.fontSize}px</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() =>
                onChange({ ...settings, fontSize: Math.max(14, settings.fontSize - 1) })
              }
              className="flex h-9 w-10 items-center justify-center rounded-lg border border-border-subtle bg-surface-elevated text-sm font-bold text-ink-primary active:scale-95"
            >
              A-
            </button>
            <input
              type="range"
              min="14"
              max="26"
              step="1"
              value={settings.fontSize}
              onChange={(e) =>
                onChange({ ...settings, fontSize: parseInt(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-elevated accent-accent-gold"
            />
            <button
              onClick={() =>
                onChange({ ...settings, fontSize: Math.min(26, settings.fontSize + 1) })
              }
              className="flex h-9 w-10 items-center justify-center rounded-lg border border-border-subtle bg-surface-elevated text-sm font-bold text-ink-primary active:scale-95"
            >
              A+
            </button>
          </div>
        </div>

        {/* 4. Line Spacing */}
        <div className="mt-4">
          <label className="text-xs font-medium text-ink-muted">Giãn cách dòng</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { label: "Gọn gàng", value: 1.6 },
              { label: "Tiêu chuẩn", value: 1.85 },
              { label: "Thoáng đãng", value: 2.1 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onChange({ ...settings, lineHeight: item.value })}
                className={cn(
                  "rounded-xl border p-2 text-xs font-medium transition-all",
                  settings.lineHeight === item.value
                    ? "border-accent-gold bg-surface-elevated text-accent-gold"
                    : "border-border-subtle text-ink-secondary"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
