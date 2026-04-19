export function ErrorBanner({ error, onDismiss }: { error: Error; onDismiss: () => void }) {
  return (
    <div className="cd-enter-slide-down mx-4 mb-2 flex items-start gap-2 rounded-xl border border-[#C0462A]/30 bg-[#FDEFE8] px-3 py-2 text-[12px] text-[#7A2A13]">
      <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C0462A]" />
      <div className="flex-1 space-y-0.5">
        <div className="font-medium text-[#4A1D0C]">Generation failed</div>
        <div className="whitespace-pre-wrap break-words">{error.message}</div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#7A2A13]/70 hover:text-[#7A2A13]"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
