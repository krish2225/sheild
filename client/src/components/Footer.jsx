export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900/70">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-400 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <div>© {new Date().getFullYear()} Shield IoT</div>
        <div className="hidden sm:block">•</div>
        <div className="text-slate-500">Predictive Maintenance Platform</div>
      </div>
    </footer>
  )
}


