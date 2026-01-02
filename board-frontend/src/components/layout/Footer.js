'use client';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-slate-400">
            © 2026 Q&A Board. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            멋쟁이사자처럼 : java 19기 · Team Return7
          </p>
        </div>
      </div>
    </footer>
  );
}

