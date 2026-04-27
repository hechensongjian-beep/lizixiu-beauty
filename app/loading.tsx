export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-[#e8d5b8] border-t-[#c9a87c] animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
      </div>
      <p className="var(--foreground-muted) text-sm">加载中...</p>
    </div>
  );
}
