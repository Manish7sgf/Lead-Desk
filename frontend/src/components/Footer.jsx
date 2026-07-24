import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800/50 bg-[#09090b] py-6 px-4 mt-auto text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-zinc-400">
          LeadDesk Mini &mdash; Simple Triage Engine
        </p>
        <div>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all font-medium"
          >
            <span>Built for</span>
            <span className="text-zinc-200 font-semibold underline underline-offset-2 decoration-zinc-600">Digital Heroes Training Task</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
