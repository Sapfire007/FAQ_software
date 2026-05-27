import { Link } from 'react-router-dom';

export default function TopNavBar({ active }) {
  return (
    <header className="bg-surface-bright dark:bg-admin-bg font-headline-md text-headline-md font-body-md text-body-md docked full-width top-0 h-header-height border-b-[1.5px] border-ink-100 dark:border-admin-border flat no shadows flex justify-between items-center w-full px-container-margin max-w-full mx-auto z-50 sticky">
      <div className="flex items-center gap-8">
        <div className="font-headline-md text-headline-md font-black tracking-tight text-ink-900 dark:text-ink-50 cursor-pointer hover:text-primary transition-colors">
          VINS · Yaksha
        </div>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <a href="#" className="text-ink-400 dark:text-ink-400 font-normal hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors h-full flex items-center px-2">Overview</a>
          <Link to="/faq" className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'faq' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}>FAQ</Link>
          <a href="#" className="text-ink-400 dark:text-ink-400 font-normal hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors h-full flex items-center px-2">samagama</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">search</span>
          <input type="text" placeholder="Search..." className="bg-surface border border-ink-200 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-primary focus:border-b-2 transition-all font-body-sm text-body-sm text-ink-900" />
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors active:scale-[0.98] transition-transform duration-150 text-ink-700">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors active:scale-[0.98] transition-transform duration-150 text-ink-700">
          <span className="material-symbols-outlined">help_center</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-ink-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all active:scale-[0.98] transition-transform duration-150">
          <img src="https://picsum.photos/seed/user_profile/200/200" alt="User profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
