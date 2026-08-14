'use client';

import { useRef, useState } from 'react';
import { Modal } from '@/components/ui/primitives';
import { PRESET_AVATARS } from '@/lib/presets';
import { cn } from '@/lib/utils';

const OUTPUT_SIZE = 256;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024; // 10MB — just to avoid processing something absurd

interface Props {
  open: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onSelect: (dataUrl: string) => void;
}

export function AvatarPickerModal({ open, onClose, currentAvatarUrl, onSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError('That image is too large — try one under 10MB.');
      return;
    }

    setError(null);
    setProcessing(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setProcessing(false);
      setError('Could not read that file.');
    };
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => {
        setProcessing(false);
        setError('Could not read that image.');
      };
      img.onload = () => {
        // Center-crop to a square, then downscale — keeps the stored
        // string small (typically tens of KB) regardless of the source
        // photo's resolution.
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessing(false);
          setError('Your browser could not process that image.');
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        onSelect(canvas.toDataURL('image/jpeg', 0.85));
        setProcessing(false);
        onClose();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <Modal open={open} onClose={onClose} title="Update profile picture">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors disabled:opacity-50"
      >
        <UploadIcon />
        {processing ? 'Processing…' : 'Upload a photo'}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <p className="mt-5 mb-2 text-xs font-medium text-fg-muted">Or choose a preset</p>
      <div className="grid grid-cols-5 gap-2.5">
        {PRESET_AVATARS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              onSelect(preset.dataUri);
              onClose();
            }}
            className={cn(
              'aspect-square rounded-full overflow-hidden ring-2 ring-offset-2 transition-all',
              currentAvatarUrl === preset.dataUri ? 'ring-accent' : 'ring-transparent hover:ring-border',
            )}
            style={{ ['--tw-ring-offset-color' as string]: 'var(--card)' }}
            aria-label={`Use ${preset.id} preset avatar`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preset.dataUri} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}
