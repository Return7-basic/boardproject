'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2024 Q&A Board. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> by Team Return7
          </p>
        </div>
      </div>
    </footer>
  );
}

