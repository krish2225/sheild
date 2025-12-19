import ShieldLogo from './ShieldLogo'

export default function Footer() {
  return (
    <footer className="bg-slate-900/90 border-t border-slate-700 mt-auto w-full h-[20vh] min-h-[160px] flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-4 w-full">
        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
          <div className="text-slate-400 text-xs md:text-sm text-center">
            © 2024 SHIELD Industrial Monitoring System. All rights reserved.
          </div>
          <div className="text-slate-200 text-sm md:text-base font-semibold text-center">
            Developed by <span className="text-cyan-300 font-semibold">Krish Namboodri</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-cyan-300 font-semibold">Utkarsh Sapkal</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-cyan-300 font-semibold">Fardin Pirjade</span>
          </div>
        </div>
      </div>
    </footer>
  )
}