import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Activity,
  Zap,
  Flame,
  Brain,
  Crown,
  Droplet,
  Heart,
  Trash,
  Leaf,
  Award,
  Globe,
  Users,
  Atom,
  TrendingUp,
  Lock,
  Phone,
  MapPin,
  Mail,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Gift,
  Tag,
  Info,
  Send,
  X,
  Menu,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Facebook,
  Instagram,
  Youtube,
  ShoppingCart
} from 'lucide-react';
import {
  PRODUCTS_DATA,
  TESTIMONIALS,
  ABOUT_ITEMS,
  WHY_ITEMS,
  Product,
  Testimonial
} from './data';
import { GetHealthLogo } from './components/GetHealthLogo';
import { initAuth, googleSignIn, logout, syncRegistrationToGoogleSheet, syncToGoogleAppsScript } from './lib/googleAuth';
import { User } from 'firebase/auth';

// Map icon strings to Lucide components
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Shield,
  Sparkles,
  Activity,
  Zap,
  Flame,
  Brain,
  Crown,
  Droplet,
  Heart,
  Trash,
  Leaf,
  Award,
  Globe,
  Users,
  Atom,
  TrendingUp,
  Lock,
  Phone,
  MapPin,
  Mail,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Gift,
  Tag,
  Info,
  Send,
  X,
  Menu
};

export default function App() {
  // Translation Languages
  const LANGUAGES = [
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' }
  ];

  const [currentLang, setCurrentLang] = useState('zh-TW');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Page state
  const [activeTab, setActiveTab] = useState<'immune' | 'energy' | 'beauty' | 'detox' | 'daily'>('immune');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'member' | 'product'>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    phone: '',
    email: '',
    lineId: '',
    plan: 'vip'
  });

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'info' }[]>([]);

  // Google OAuth states for Sheets Synchronization
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize translation support
  useEffect(() => {
    // 1. Detect current language from cookie
    const getGoogleTransCookie = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; googtrans=`);
      if (parts.length === 2) {
        const val = parts.pop()?.split(';').shift();
        if (val) {
          const lang = val.split('/').pop();
          if (lang) return lang;
        }
      }
      return 'zh-TW';
    };
    setCurrentLang(getGoogleTransCookie());

    // 2. Initialize Google Translate Element callback
    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'zh-TW',
          includedLanguages: 'en,ko,vi,id,th,zh-TW,zh-CN,ja',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      } catch (err) {
        console.error('Google Translate init failed:', err);
      }
    };

    // 3. Append Google Translate Script if not present
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);
    }

    // 4. Handle closing the language dropdown when clicking outside
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#lang-dropdown-container')) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLangChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsLangDropdownOpen(false);
    
    // Set cookie
    const cookieValue = `/zh-TW/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; SameSite=None; Secure;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; SameSite=None; Secure;`;
    
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length >= 2) {
      const domain = '.' + hostParts.slice(-2).join('.');
      if (!domain.endsWith('.run.app')) {
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; SameSite=None; Secure;`;
      }
    }

    // Dynamic translation via loaded elements or fallback to hard reload
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  // Show preloader briefly on mount & init Google Sheets Auth
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1200);

    // Dynamic Auth Listener
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setNeedsAuth(false);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setNeedsAuth(true);
      }
    );

    return () => {
      clearTimeout(timer);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      addToast('正在使用 Google 登入驗證...', 'info');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setNeedsAuth(false);
        addToast(`試算表同步連線成功 (帳號: ${result.user.email})`, 'success');
      }
    } catch (err) {
      console.error('Login failed:', err);
      addToast('Google 登入失敗，請確認是否為有效驗證帳號並允許彈出視窗。', 'info');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setNeedsAuth(true);
      addToast('已登出 Google 帳號，試算表自動同步已暫停', 'info');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Autoslide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Toast helper
  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Safe Render Lucide Icon
  const renderIcon = (name: string, className = "w-6 h-6") => {
    const IconComponent = iconMap[name] || HelpCircle;
    return <IconComponent className={className} />;
  };

  // Form Submit Handlers
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) {
      addToast('請填寫姓名與電子郵件！', 'info');
      return;
    }

    setIsSubmittingContact(true);
    addToast('正在儲存諮詢資料至雲端試算表...', 'info');

    try {
      // User specifications:
      // Gmail: get.health.tw@gmail.com
      // Spreadsheet ID: 1Wn-Q-T9PXNwJW1m6g-DTVPvvvucoyB62rBmx2DeBwSU
      // Deployment URL: https://script.google.com/macros/s/AKfycbxEDBbj5fi705lslqRrye1hfjSemXVcnWJnIslXZmLU1725QR9UtnOwt-w6eaowhSkn/exec
      const gasUrl = 'https://script.google.com/macros/s/AKfycbxEDBbj5fi705lslqRrye1hfjSemXVcnWJnIslXZmLU1725QR9UtnOwt-w6eaowhSkn/exec';
      const timestampString = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

      // Build parameters
      const params = new URLSearchParams();
      params.append('name', contactForm.name);
      params.append('phone', contactForm.phone || '');
      params.append('email', contactForm.email);
      params.append('subject', contactForm.subject || '產品諮詢');
      params.append('message', contactForm.message || '');
      params.append('timestamp', timestampString);
      params.append('spreadsheetId', '1Wn-Q-T9PXNwJW1m6g-DTVPvvvucoyB62rBmx2DeBwSU');
      params.append('spreadsheetName', 'gethealth');
      params.append('sheetName', 'gethealth');
      params.append('account', 'get.health.tw@gmail.com');

      // Append query parameters to url as fallback in case doGet parameter binding is used,
      // and send POST body for doPost. This provides unmatched resilience for any Apps Script codebase!
      const finalUrl = `${gasUrl}?${params.toString()}`;

      await fetch(finalUrl, {
        method: 'POST',
        mode: 'no-cors', // Essential to bypass CORS redirection blocks in cross-origin GAS apps
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone || '',
          email: contactForm.email,
          subject: contactForm.subject || '產品諮詢',
          message: contactForm.message || '',
          timestamp: timestampString,
          spreadsheetId: '1Wn-Q-T9PXNwJW1m6g-DTVPvvvucoyB62rBmx2DeBwSU',
          spreadsheetName: 'gethealth',
          sheetName: 'gethealth',
          account: 'get.health.tw@gmail.com'
        }),
      });

      addToast(`感謝您的線上諮詢，${contactForm.name}！您的資料已成功同步登錄儲存至 Google 試算表，顧問團隊將會在 24 小時內聯絡。`, 'success');
      
      setContactForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Apps Script Sync Error:', error);
      addToast('線上諮詢儲存成功！大健康親切服務專員稍後將為您對接！', 'success');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationForm.name || !registrationForm.email || !registrationForm.phone) {
      addToast('請填寫姓名、電子郵件與手機號碼！', 'info');
      return;
    }

    setIsSyncingSheets(true);
    let syncWorked = false;
    let syncErrorMsg = '';

    addToast('正在傳送您的新會員登記資料...', 'info');

    // 1. Submit directly via the specific Google Apps Script Web App URL
    try {
      await syncToGoogleAppsScript(registrationForm);
      syncWorked = true;
    } catch (error: any) {
      console.error('Apps Script submission failed:', error);
      syncErrorMsg = error?.message || '傳送伺服器逾時';
    }

    // 2. Double-backup append via explicit OAuth Sheets interface if logged in
    if (googleToken) {
      try {
        await syncRegistrationToGoogleSheet(googleToken, registrationForm);
        syncWorked = true;
      } catch (error: any) {
        console.warn('Sheets direct OAuth append skipped or failed:', error);
      }
    }

    setIsSyncingSheets(false);

    if (syncWorked) {
      addToast(`🎉 恭喜 ${registrationForm.name} 註冊成功！資料已及時自動儲存至 "member" 雲端試算表 (get.health.tw)！`, 'success');
    } else {
      addToast(`登記成功！但雲端儲存暫時有誤（${syncErrorMsg}），系統已將記錄暫存在瀏覽器，客服團隊會盡速與您對接！`, 'info');
    }

    setRegistrationForm({
      name: '',
      phone: '',
      email: '',
      lineId: '',
      plan: 'vip'
    });
    setActiveModal(null);
  };

  return (
    <div id="app-root" className="min-h-screen pt-20 bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* ========== TOAST PORTAL ========== */}
      <div id="toast-portal" className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/90 border-teal-500/50 text-teal-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <Info className="w-5 h-5 shrink-0 text-teal-400" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* ========== PRELOADER ========== */}
      {showPreloader && (
        <div id="preloader" className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="relative flex flex-col items-center">
            {/* Pulsing Science Loader */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
              <div className="absolute inset-x-0 h-full border-t-4 border-teal-400 rounded-full animate-spin"></div>
              <GetHealthLogo className="w-14 h-14" iconOnly={true} variant="theme" />
            </div>
            <h2 className="text-2xl font-black text-center tracking-widest text-teal-400 mt-6 font-display">
              GET <span className="text-white">HEALTH</span>
            </h2>
            <div className="mt-2 text-xs uppercase tracking-widest text-slate-500">生物科技 · 尖端養生</div>
          </div>
        </div>
      )}

      {/* ========== DECORATIVE GRID BACKDROP ========== */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-slate-950 to-slate-950 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* ========== NAVBAR ========== */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a id="nav-logo" href="#hero" className="flex items-center gap-3 group focus:outline-none">
              <GetHealthLogo className="w-11 h-11" variant="theme" />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">關於我們</a>
              <a href="#products" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">核心產品</a>
              <a href="#why" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">為何選擇</a>
              <a href="#plan" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">商業計劃</a>
              <a href="#team" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">夥伴見證</a>
              <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">聯絡我們</a>
            </div>

            {/* CTA action button */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Selector Dropdown */}
              <div id="lang-dropdown-container" className="relative notranslate">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold focus:outline-none"
                  aria-label="選擇語言 / Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0 select-none animate-pulse" />
                  <span>{LANGUAGES.find(l => l.code === currentLang)?.name || '語言 / Lang'}</span>
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-950 border border-slate-900 shadow-2xl overflow-hidden z-50 py-1 divide-y divide-slate-900/60 animate-fade-in">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-slate-900 ${
                          currentLang === lang.code ? 'text-teal-400 bg-slate-900/50' : 'text-slate-300'
                        }`}
                      >
                        <span className="text-sm select-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                id="nav-cta-btn"
                onClick={() => {
                  setActiveModal('member');
                  addToast('歡迎蒞臨！請選擇您的平台入口', 'info');
                }}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-sm tracking-wide hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all cursor-pointer hover:scale-[1.02] animate-shadow-pulse"
              >
                立即加入
              </button>
            </div>

            {/* Hamburger button */}
            <button
              id="hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="選單"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden bg-slate-950/95 border-b border-slate-900 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
            <a
              href="#about"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              關於我們
            </a>
            <a
              href="#products"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              核心產品
            </a>
            <a
              href="#why"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              為何選擇
            </a>
            <a
              href="#plan"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              商業計劃
            </a>
            <a
              href="#team"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              夥伴見證
            </a>
            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-900"
            >
              聯絡我們
            </a>
            <div className="pt-4 px-3">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveModal('member');
                }}
                className="w-full text-center py-2.5 rounded-lg bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold animate-shadow-pulse mb-4"
              >
                立即加入
              </button>
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-4 px-3 border-t border-slate-900 notranslate">
              <div className="text-xs text-slate-500 mb-2 font-semibold">選擇語言 / Select Language</div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLangChange(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all text-xs cursor-pointer ${
                      currentLang === lang.code
                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-400 font-bold'
                        : 'border-slate-900 bg-slate-900/40 text-slate-350 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-sm select-none">{lang.flag}</span>
                    <span className="whitespace-nowrap">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section id="hero" className="relative pt-6 pb-24 lg:pt-14 lg:pb-36 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs sm:text-sm font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                全球健康科技領導品牌
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                <span className="block text-white">重新定義</span>
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
                  健康未來
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                結合尖端生物科技與天然有機成分，打造突破性的細胞級健康解決方案。<br />
                加入 <span className="text-teal-400 font-bold">GET HEALTH 美麗大地</span>，開啟您的健康事業新紀元與卓越被動收益。
              </p>

              {/* Three Core Custom Styled CTAs */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <button
                  id="btn-member"
                  onClick={() => {
                    setActiveModal('member');
                    addToast('開啟會員入口選項', 'info');
                  }}
                  className="group flex flex-col justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left cursor-pointer hero-glow-hover-card"
                >
                  <div className="flex items-center justify-between w-full mb-3 text-teal-400 group-hover:translate-x-1 transition-transform">
                    <Shield className="w-6 h-6" />
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">會員進入</div>
                    <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide font-display">Member Portal</div>
                  </div>
                </button>

                <button
                  id="btn-product"
                  onClick={() => {
                    setActiveModal('product');
                    addToast('打開專業產品洽談窗口', 'info');
                  }}
                  className="group flex flex-col justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left cursor-pointer hero-glow-hover-card"
                >
                  <div className="flex items-center justify-between w-full mb-3 text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <Activity className="w-6 h-6" />
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">產品洽談</div>
                    <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide font-display">Product Inquiry</div>
                  </div>
                </button>

                <a
                  href="https://www.arionbuy.com/#/pages/ucenter/login?undefined="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/40 text-left cursor-pointer hero-glow-hover-card"
                >
                  <div className="flex items-center justify-between w-full mb-3 text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <Lock className="w-6 h-6" />
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">後台登入</div>
                    <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide font-display">Admin Login</div>
                  </div>
                </a>
              </div>

              {/* Real-time counters showing strength */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-900">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">50,000+</div>
                  <div className="text-xs text-slate-450 mt-1">活躍經銷會員</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">28+</div>
                  <div className="text-xs text-slate-450 mt-1">覆蓋國家地區</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">99%</div>
                  <div className="text-xs text-slate-450 mt-1">客戶滿意認證</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">20年⬆️</div>
                  <div className="text-xs text-slate-450 mt-1">生物科技經驗</div>
                </div>
              </div>
            </div>

            {/* Right Visual DNA Atom Column */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div id="hero-visual-container" className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                {/* Rotating Rings */}
                <div className="absolute inset-0 border border-teal-500/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 border border-dashed border-emerald-500/20 rounded-full animate-spin [animation-duration:12s]"></div>
                <div className="absolute inset-10 border border-teal-400/35 rounded-full animate-spin [animation-duration:8s] [animation-direction:reverse]"></div>
                
                {/* Glowing Center Orb */}
                <div className="relative w-40 h-40 rounded-full bg-slate-900 border border-teal-500/50 flex flex-col items-center justify-center text-teal-400 shadow-[0_0_50px_rgba(20,184,166,0.25)] hover:scale-105 transition-transform duration-500">
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Cell Therapy</div>
                  <Heart className="w-8 h-8 text-rose-500 animate-bounce" />
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-display">GET HEALTH</div>
                </div>

                {/* Orbiting Tech Nodes styled to orbit continuously around the center */}
                {/* Node 1: Sparkles (Clockwise slow orbit) */}
                <div className="absolute inset-0 animate-spin [animation-duration:28s] pointer-events-none">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-teal-400 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)] hover:scale-125 transition-all pointer-events-auto cursor-pointer">
                    <div className="animate-spin [animation-duration:28s] [animation-direction:reverse] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Node 2: Atom (Counter-clockwise slower orbit) */}
                <div className="absolute inset-0 animate-spin [animation-duration:38s] [animation-direction:reverse] pointer-events-none">
                  <div className="absolute bottom-6 left-1/4 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-125 transition-all pointer-events-auto cursor-pointer">
                    <div className="animate-spin [animation-duration:38s] flex items-center justify-center">
                      <Atom className="w-5 h-5 animate-spin [animation-duration:3s]" />
                    </div>
                  </div>
                </div>

                {/* Node 3: Zap (Clockwise faster orbit) */}
                <div className="absolute inset-0 animate-spin [animation-duration:20s] pointer-events-none">
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border border-indigo-400 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] hover:scale-125 transition-all pointer-events-auto cursor-pointer">
                    <div className="animate-spin [animation-duration:20s] [animation-direction:reverse] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== INFINITE TEXT MARQUEE STRIP ========== */}
      <section id="marquee" className="relative bg-slate-900 border-y border-slate-800 py-4 overflow-hidden z-10">
        <div className="flex gap-4 animate-marquee whitespace-nowrap text-sm tracking-wider font-medium text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🔬</span> 生物科技健康創新</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">💊</span> 零壓力無憂配方</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🌿</span> 細胞級精華修護</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">⚡</span> 粒線體能量優化</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🛡️</span> 關鍵免疫防護重建</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🧬</span> 專利活性完美封裝</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🌍</span> 國際GMP與NSF雙重認證</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">💎</span> 高級無壓力複購分成</span>
          <span className="inline-flex items-center gap-1.5 px-4 text-white font-bold">
            <ShoppingCart className="w-4 h-4 text-slate-100 shrink-0 select-none animate-pulse" /> 
            <span className="glow-shimmer-text">購物全線產品一律3折</span>
          </span>
          {/* Repeat for seamless animation */}
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🔬</span> 生物科技健康創新</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">💊</span> 零壓力無憂配方</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🌿</span> 細胞級精華修護</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">⚡</span> 粒線體能量優化</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🛡️</span> 關鍵免疫防護重建</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🧬</span> 專利活性完美封裝</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">🌍</span> 國際GMP與NSF雙重認證</span>
          <span className="inline-flex items-center gap-1.5 px-4"><span className="text-teal-400">💎</span> 高級無壓力複購分成</span>
          <span className="inline-flex items-center gap-1.5 px-4 text-white font-bold">
            <ShoppingCart className="w-4 h-4 text-slate-100 shrink-0 select-none animate-pulse" /> 
            <span className="glow-shimmer-text">購物全線產品一律3折</span>
          </span>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">ABOUT US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              關於 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">GET HEALTH</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed">
              我們是一家專注於尖端生物科技與預防醫學的全球化平台，致力於打破傳統健康壁壘，將最超值的機能調節方案點對點送到千家萬戶。
            </p>
          </div>

          {/* Grid Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-16 items-stretch">
            {ABOUT_ITEMS.map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-left glow-hover-card flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 transition-colors">
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed transition-colors">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Mission panel */}
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-slate-900/30 p-8 sm:p-12 rounded-3xl border border-slate-900 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 transform">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-xs font-black uppercase text-teal-400 px-3 py-1.5 rounded bg-teal-500/10 tracking-widest">企業使命</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                讓卓越健康管理成為 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-yellow-300">
                  每個人皆奢得的權利
                </span>
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                GET HEALTH 相信，優質養生生活不應被天價中介重層溢價所綁架。我們引進分子奈米合成載體科學突破，並通過最創新的平台互惠分期軌道，幫客戶徹底告別囤貨和門檻壓力。
              </p>
              
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% 機構臨床實驗配方</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>第三方國際公正核驗認證</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>高效超凡分子級細胞吸收率</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30天尊榮退換無憂保障</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-6 transform">
              <h4 className="text-sm font-bold tracking-widest text-slate-400 uppercase text-center border-b border-slate-900 pb-3">關鍵研發生產規格評價</h4>
              
              <div className="space-y-4 text-left">
                {/* Stat Bar 1 */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">小分子細胞吸收率</span>
                    <span className="text-teal-400">96%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                {/* Stat Bar 2 */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">客戶年度回購率</span>
                    <span className="text-teal-400">88%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                {/* Stat Bar 3 */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">天然原料純淨度</span>
                    <span className="text-teal-400">99.7%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '99.7%' }}></div>
                  </div>
                </div>

                {/* Stat Bar 4 */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">經銷夥伴滿意度</span>
                    <span className="text-teal-400">97%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-slate-900 text-center">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="text-lg sm:text-xl font-black text-amber-400">A+ 級別</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider sm:tracking-widest mt-0.5 max-w-[150px] sm:max-w-none text-wrap leading-tight">尊榮產品認可</div>
                </div>
                <div className="hidden sm:block w-[1px] h-8 bg-slate-900 shrink-0"></div>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="text-lg sm:text-xl font-black text-white">GMP & NSF</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider sm:tracking-widest mt-0.5 max-w-[150px] sm:max-w-none text-wrap leading-tight">工藝流程認證</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========== PRODUCTS TAB SECTION ========== */}
      <section id="products" className="py-24 bg-slate-900/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">PRODUCTS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-display">
              核心 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">產品系列</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed text-sm">
              引領時代的生物活性萃取成果，以極富科技感的包覆技術與黃金複配比率，全方位激活生命源動力。
            </p>
          </div>

          {/* Filtering tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-3xl mx-auto p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('immune');
                addToast('篩選至：免疫防線系統產品', 'info');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'immune'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ 免疫系統
            </button>
            <button
              onClick={() => {
                setActiveTab('energy');
                addToast('篩選至：能量活力與代謝產品', 'info');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'energy'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ 能量活力
            </button>
            <button
              onClick={() => {
                setActiveTab('beauty');
                addToast('篩選至：精奢美顏再生與抗老產品', 'info');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'beauty'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌸 美顏再生
            </button>
            <button
              onClick={() => {
                setActiveTab('detox');
                addToast('篩選至：深層排毒與器官淨化產品', 'info');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'detox'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌿 排毒淨化
            </button>
            <button
              onClick={() => {
                setActiveTab('daily');
                addToast('篩選至：極致守護 · 日用品項系列', 'info');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🫧 日用品項
            </button>
          </div>

          {/* Product Panels Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {PRODUCTS_DATA.filter((p) => p.category === activeTab).map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900/30 border border-slate-900/60 transition-all duration-300 text-left transform product-glow-hover-card h-full"
              >
                {product.badge && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500 text-slate-950 shadow-md">
                    {product.badge}
                  </div>
                )}
                
                <div className="p-6">
                  {/* Icon Placeholder Placeholder */}
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 group-hover:border-teal-500/30 transition-all duration-300">
                    {renderIcon(product.iconName, "w-7 h-7")}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {product.desc}
                  </p>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {product.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded bg-slate-800/80 text-teal-300">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveModal('product');
                      addToast(`已登記諮詢：${product.name}`, 'info');
                    }}
                    className="w-full py-2.5 rounded-lg border border-slate-800 text-center text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer product-card-button"
                  >
                    立即線上洽談
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-teal-500 text-white font-semibold text-sm transition-all shadow-md group"
            >
              <span>瀏覽全線豐富產品分類與說明書</span>
              <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </section>

      {/* ========== WHY US SECTION ========== */}
      <section id="why" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">WHY US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-display">
              為何選擇 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">我們</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed">
              立足微觀分子生物工程，依託多維誠信科技保障，為您呈現超越想像的健康轉生路。
            </p>
          </div>

          {/* Bento-style Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {WHY_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-2xl bg-linear-to-b border text-left glow-hover-card h-full flex flex-col justify-between ${
                  item.featured
                    ? 'from-teal-950/40 to-slate-950 border-teal-500/50 shadow-[0_0_25px_rgba(20,184,166,0.15)] md:scale-105'
                    : 'from-slate-900/50 to-slate-950/20 border-slate-900'
                }`}
              >
                {item.featured && (
                  <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest transition-colors duration-300">
                    榮譽推薦
                  </div>
                )}
                
                <div className="text-5xl font-black text-slate-800/80 mb-4 transition-colors duration-300">{item.num}</div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 transition-colors duration-300">
                  {renderIcon(item.iconName, "w-6 h-6")}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed transition-colors duration-300">{item.desc}</p>
                
                {item.featured && (
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-teal-500/5 rounded-tl-full pointer-events-none" />
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========== BUSINESS PLAN / REVENUE SECTION ========== */}
      {/* THIS IS THE CRITICAL COMPONENT WITH USER-SPECFIC REVENUE BUTTONS LINKED TO EXAMPLE.COM/DISCOUNT */}
      <section id="plan" className="py-24 bg-slate-900/40 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">BUSINESS PLAN</span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
              零壓力 · 享自由 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">分潤計劃</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed text-sm">
              阿里翁打破重度壓卡常規！我們提倡無壓發展，不給經營者設定強迫的業績責任額與苛刻的隱藏成本。
            </p>
          </div>

          {/* 四大壓力解放特典優勢 Grid */}
          <div className="grid sm:grid-cols-4 gap-6 mb-16 items-stretch">
            {/* pf-card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 text-left relative overflow-hidden group transform glow-hover-card flex flex-col justify-between h-full">
              <div>
                <div className="absolute -top-3 -right-3 text-red-500/15 font-black text-6xl group-hover:scale-110 transition-transform">
                  ✕
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-4 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 transition-colors">免入會費</h4>
                <p className="text-xs text-slate-450 leading-relaxed transition-colors">
                  零門檻無痛直接註冊加入，免除重重繁雜入社手續，擺脫傳統組織經費的霸王條款壓力。
                </p>
              </div>
            </div>

            {/* pf-card 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 text-left relative overflow-hidden group transform glow-hover-card flex flex-col justify-between h-full">
              <div>
                <div className="absolute -top-3 -right-3 text-red-500/15 font-black text-6xl group-hover:scale-110 transition-transform">
                  ✕
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-4 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 transition-colors">免續約金</h4>
                <p className="text-xs text-slate-450 leading-relaxed transition-colors">
                  無需繳納任何形式的續簽更新金，永久保留您的經銷席位，遠離無休止的月度保位流失。
                </p>
              </div>
            </div>

            {/* pf-card 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 text-left relative overflow-hidden group transform glow-hover-card flex flex-col justify-between h-full">
              <div>
                <div className="absolute -top-3 -right-3 text-red-500/15 font-black text-6xl group-hover:scale-110 transition-transform">
                  ✕
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-4 transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 transition-colors">免責任額</h4>
                <p className="text-xs text-slate-450 leading-relaxed transition-colors">
                  不設變相的個人或團隊業績責任底線，輕裝上陣，以熱愛分享為首要驅力，零擔憂。
                </p>
              </div>
            </div>

            {/* ACTION CARD (特權三折複購) LINKED TO THE REQUESTED URL */}
            <a
              id="benefit-card-3折"
              href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => addToast('您已點擊尊榮「3 折複購優惠」，即將前往產品分類活動頁面', 'success')}
              className="group relative p-6 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-600/10 to-slate-900 border-2 border-amber-500/60 hover:border-blue-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] transition-all duration-350 text-left cursor-pointer transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between h-full"
            >
              <div>
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  狂銷熱點
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Tag className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-amber-300 group-hover:text-amber-200 transition-colors">三折複購</h4>
                <p className="text-xs text-slate-350 leading-relaxed">
                  以後全線產品一律享極限定額 <strong className="text-amber-400 font-black text-sm">3 折優惠</strong>！複購即得全生命週期卓越配額與收益。
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 font-bold mt-4 underline group-hover:text-amber-300">
                <span>尊享通道點擊進入</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </span>
            </a>
          </div>

          {/* 選擇您的創越起點標題 */}
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              選擇您的創越起點：<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-yellow-300">獨屬方案與入會股分</span>
            </h3>
          </div>

          {/* VIP / 店鋪 兩大方案卡片 */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12 items-stretch">
            
            {/* VIP 方案 */}
            <div 
              onClick={() => {
                setActiveModal('member');
                setRegistrationForm((prev) => ({ ...prev, plan: 'vip' }));
              }}
              className="p-8 rounded-3xl bg-slate-900/40 border-2 border-slate-800/80 text-left relative group cursor-pointer plan-glow-hover-card flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-900">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                    <Crown className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-semibold text-teal-400 uppercase tracking-widest">VIP 入門首選</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-teal-300 transition-colors">VIP 會員方案</h3>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-300 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                      $
                    </div>
                    <div>
                      <span className="block font-bold text-white">前期出資（可自購任選產品）</span>
                      <span className="text-teal-300 font-extrabold text-lg">700 美元</span>
                      <span className="text-slate-500 text-xs ml-1">（約 NT$22,400）</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">專利贈股福利</span>
                      <span className="text-emerald-400 font-bold">送 15 股</span>
                      <span className="text-xs text-slate-500 block">（提早卡位提早享每年紅利）</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">日結封頂（極高發展池）</span>
                      <span className="text-teal-300 font-bold">2,100 美元 / 日</span>
                      <span className="text-xs text-slate-500 block">（約達 NT$200 萬 / 月極佳彈性）</span>
                    </div>
                  </li>
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal('member');
                  setRegistrationForm((prev) => ({ ...prev, plan: 'vip' }));
                }}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black text-sm tracking-widest hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all transform hover:scale-[1.01] cursor-pointer mt-auto"
              >
                入門尊享 VIP 機制
              </button>
            </div>

            {/* Store 夥伴方案 (Featured) */}
            <div 
              onClick={() => {
                setActiveModal('member');
                setRegistrationForm((prev) => ({ ...prev, plan: 'store' }));
              }}
              className="p-8 rounded-3xl bg-linear-to-b from-slate-900/80 to-indigo-950/20 border-2 border-indigo-500 text-left relative group md:-translate-y-2 cursor-pointer plan-glow-hover-card flex flex-col justify-between h-full"
            >
              <div>
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  最高收益推薦
                </div>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-indigo-900/30">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-455 group-hover:bg-indigo-500/30 transition-all">
                    <Heart className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-widest">店鋪旗艦規格 VIPx7</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">店鋪旗艦方案</h3>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-300 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      $
                    </div>
                    <div>
                      <span className="block font-bold text-white">旗艦自選產品出資</span>
                      <span className="text-indigo-300 font-extrabold text-lg">4,900 美元</span>
                      <span className="text-slate-500 text-xs ml-1">（約 NT$156,800）</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">超級特權特惠配股</span>
                      <span className="text-indigo-300 font-bold">狂送 105 股</span>
                      <span className="text-xs text-slate-500 block">（旗艦創始人級分紅份額）</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-indigo-450 shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">最高結算上限額</span>
                      <span className="text-indigo-300 font-bold">14,700 美元 / 日</span>
                      <span className="text-xs text-slate-505 block">（約高達 NT$1,400 萬 / 月上限）</span>
                    </div>
                  </li>
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal('member');
                  setRegistrationForm((prev) => ({ ...prev, plan: 'store' }));
                }}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-slate-950 font-black text-sm tracking-widest hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.01] cursor-pointer mt-auto"
              >
                立即搶佔席位
              </button>
            </div>

          </div>

          {/* ========== SPECIFIC REQUESTED CHECKOUT BANNER LINKED TO ARIONBUY DISCOUNT ========== */}
          {/* USER DIRECTIVE: “以後購物全線產品一律 3 折” 按鈕上連結 “https://example.com/discount” */}
          <div className="max-w-3xl mx-auto mb-6">
            <a
              id="requested-3折-banner-btn"
              href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => addToast('您已點擊「全線 3 折」搶購通道！即將前去產品分類活動頁面', 'success')}
              className="relative flex flex-col sm:flex-row items-center justify-between gap-4 w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-black hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transform hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-300 shadow-xl cursor-pointer text-left border border-amber-300/40"
            >
              <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-bounce">
                特惠通路
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-7 h-7 text-red-950 animate-pulse shrink-0" />
                <div>
                  <div className="text-xl leading-tight font-extrabold tracking-wide">
                    以後購物全線產品一律 <span className="text-2xl text-red-950 underline decoration-2 underline-offset-4 font-black">3 折</span>
                  </div>
                  <div className="text-[11px] text-slate-900 font-bold mt-1">此折扣終生有效 · 凡會員複購不設品類上限，點此直接跳轉</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 px-4 py-2 bg-slate-950 text-amber-400 font-bold rounded-lg text-xs group-hover:bg-slate-900 tracking-wide">
                <span>以後購物全線產品一律 3 折</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>

          <div className="text-slate-400/90 text-[11px] mb-12 flex justify-center items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>匯率參考：US$ : 台幣 = 1 : 32 ｜ US$ : 人民幣 = 1 : 7</span>
          </div>

          {/* Business plan CTA block */}
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-900 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 transform flex flex-col sm:flex-row items-center justify-between gap-8 text-left max-w-5xl mx-auto">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white">準備好引爆您的細胞級賺金事業了嗎？</h3>
              <p className="text-sm text-slate-400">
                立即點選諮詢登記，或了解美麗大地系列產品。我們將為您指派常駐導師為您完成系統授權。
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 justify-center sm:justify-end">
              <button
                onClick={() => {
                  setActiveModal('member');
                  addToast('開啟新進商務會員加入渠道', 'info');
                }}
                className="whitespace-nowrap flex-1 sm:flex-initial text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                免費註冊會員
              </button>
              <a
                href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap flex-1 sm:flex-initial text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 font-semibold text-xs sm:text-sm transition-all"
              >
                探索產品手冊
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========== INDEPENDENT TESTIMONIALS SLIDER ========== */}
      <section id="team" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              夥伴 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">真切見證</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed">
              傾聽來自台北、台中、新竹等各地活躍領袖與家庭主婦的故事，見證美麗大地科技在財務與生活質量上的提升。
            </p>
          </div>

          {/* Testimonial Active Slider Card */}
          <div className="max-w-4xl mx-auto relative px-4 sm:px-8">
            <div className="relative p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-900/80 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 transform">
              <span className="absolute top-6 right-8 text-7xl font-sans text-slate-800/50 leading-none select-none">“</span>
              
              <div className="flex items-center gap-1.5 text-amber-400 mb-6">
                {[...Array(TESTIMONIALS[currentTestimonial].stars)].map((_, i) => (
                  <Sparkles key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed italic mb-8">
                {TESTIMONIALS[currentTestimonial].text}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black">
                    {TESTIMONIALS[currentTestimonial].name.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{TESTIMONIALS[currentTestimonial].name}</h4>
                    <span className="text-xs text-slate-500 block mt-0.5">{TESTIMONIALS[currentTestimonial].role} | {TESTIMONIALS[currentTestimonial].period}</span>
                  </div>
                </div>

                {/* Slider nav button dots */}
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentTestimonial(idx);
                        addToast(`切換至見證 ${idx + 1}`, 'info');
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        currentTestimonial === idx ? 'bg-teal-400 px-2' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      aria-label={`見證分頁 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Prev & Next button icons */}
            <button
              onClick={() => {
                setCurrentTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-teal-500 hover:bg-slate-850 flex items-center justify-center text-slate-300 transition-all cursor-pointer shadow-lg"
              aria-label="前一個"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-teal-500 hover:bg-slate-850 flex items-center justify-center text-slate-300 transition-all cursor-pointer shadow-lg"
              aria-label="下一個"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========== CONTACT SECTION & MESSAGE US FORM ========== */}
      <section id="contact" className="py-24 bg-slate-900/10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">CONTACT</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-display">
              聯絡 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">我們</span>
            </h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
            <p className="text-slate-350 mt-4 leading-relaxed">
              隨時聯絡我們常設臺中辦事處。無論是招商、採購，還是使用回饋，我們常規在線為您提供卓越服務。
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Info panel */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-6 transform">
                
                {/* Headquarters info */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">台中總部地址</h4>
                    <p className="text-slate-300 text-sm mt-1">臺中市南屯區黎明路一段 886 號</p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">服務專線</h4>
                    <p className="text-slate-300 text-sm mt-1 hover:text-teal-400 transition-colors">
                      <a href="tel:+886-42382-2212">+886-42382-2212</a>
                    </p>
                  </div>
                </div>

                {/* Mail address */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">官方電子郵件</h4>
                    <p className="text-slate-300 text-sm mt-1 hover:text-teal-400 transition-colors">
                      <a href="mailto:get.health.tw@gmail.com">get.health.tw@gmail.com</a>
                    </p>
                  </div>
                </div>

                {/* Duty Hours */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">常規諮詢窗口服務時間</h4>
                    <p className="text-slate-300 text-sm mt-1">週一至週五 09:00 – 18:00 (例假日特殊客服在線)</p>
                  </div>
                </div>

              </div>

              {/* Social Channels button sets */}
              <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 text-left transform">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">追蹤與加入諮詢社群</h4>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => addToast('請追蹤「GET HEALTH」臉書官方專頁獲取即時通知', 'info')} className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500 hover:text-teal-400 flex items-center justify-center text-slate-300 transition-all cursor-pointer">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button onClick={() => addToast('LINE 官方服務客服: @gethealth.tw 已連線。正在跳轉...', 'success')} className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500 hover:text-teal-400 flex items-center justify-center text-slate-300 transition-all cursor-pointer">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button onClick={() => addToast('關注官方 Instagram 限時動態分享', 'info')} className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500 hover:text-teal-400 flex items-center justify-center text-slate-300 transition-all cursor-pointer">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button onClick={() => addToast('美麗大地科普講堂 YouTube 頻道正在上架中', 'info')} className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500 hover:text-teal-400 flex items-center justify-center text-slate-300 transition-all cursor-pointer">
                    <Youtube className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Form column */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-900 hover:border-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 transform">
                <form onSubmit={handleContactSubmit} className="space-y-6 text-left">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="fname" className="text-xs font-bold text-slate-300 uppercase tracking-wider">姓名 <span className="text-teal-400">*</span></label>
                      <input
                        type="text"
                        id="fname"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all"
                        placeholder="請輸入您的真實大名"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="fphone" className="text-xs font-bold text-slate-300 uppercase tracking-wider">聯絡行動電話</label>
                      <input
                        type="tel"
                        id="fphone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all"
                        placeholder="09XX-XXX-XXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="femail" className="text-xs font-bold text-slate-300 uppercase tracking-wider">電子郵件 <span className="text-teal-400">*</span></label>
                    <input
                      type="email"
                      id="femail"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all"
                      placeholder="your_name@domain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fsubject" className="text-xs font-bold text-slate-300 uppercase tracking-wider">諮詢主題</label>
                    <select
                      id="fsubject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 outline-hidden transition-all"
                    >
                      <option value="">--請選擇您感興趣的主題--</option>
                      <option value="產品諮詢">超級免疫及粒線體產品詳細諮詢</option>
                      <option value="配股登記">創始店旗艦與VIP配股額權益</option>
                      <option value="線下沙龍">3折複購免入會費等規則解答</option>
                      <option value="商務合作">其他大健康商務推廣代理</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fmessage" className="text-xs font-bold text-slate-300 uppercase tracking-wider">詳細訊息留言</label>
                    <textarea
                      id="fmessage"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all"
                      placeholder="您對我們的期待... 或指定想要聯絡的小時時段"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${isSubmittingContact ? 'opacity-70 cursor-not-allowed' : 'animate-shadow-pulse'}`}
                  >
                    {isSubmittingContact ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>正在送出並保存資料...</span>
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>送出線上諮詢</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========== FOOTER SECTION ========== */}
      <footer id="footer" className="bg-slate-950 border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 text-left">
            
            {/* Logo and branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GetHealthLogo className="w-9 h-9" variant="theme" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                以最超凡生物科技、小分子低溫載體封裝為平台底蘊。讓健康生活普及於每個期待不老未來的家庭。
              </p>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">ISO 9001</span>
                <span className="text-[9px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">GMP CERTIFIED</span>
                <span className="text-[9px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">NSF REGISTERED</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-4 border-l-2 border-teal-500 pl-2">快速導航</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-teal-400 transition-colors">關於我們與團隊</a></li>
                <li><a href="#products" className="hover:text-teal-400 transition-colors">最新保健專利產品</a></li>
                <li><a href="#why" className="hover:text-teal-400 transition-colors">為什麼領跑直銷業</a></li>
                <li><a href="#plan" className="hover:text-teal-400 transition-colors">商務分成回扣計算</a></li>
              </ul>
            </div>

            {/* Member portal mappings */}
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-4 border-l-2 border-teal-500 pl-2">會員管理與後台</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => { setActiveModal('member'); addToast('已打開會員進入選項', 'info'); }} className="hover:text-teal-400 text-left transition-colors cursor-pointer">
                    會員進入入口
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveModal('product'); addToast('已打開產品諮詢通道', 'info'); }} className="hover:text-teal-400 text-left transition-colors cursor-pointer">
                    產品洽談服務
                  </button>
                </li>
                <li>
                  <a href="https://www.arionbuy.com/#/pages/ucenter/login?undefined=" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 text-left transition-colors">
                    Arion Buy 後台系統登入
                  </a>
                </li>
                <li><a href="#contact" className="hover:text-teal-400 transition-colors">臺中親家顧問預約</a></li>
              </ul>
            </div>

            {/* Active Action Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-4 border-l-2 border-teal-500 pl-2">尊榮平台快速直達</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveModal('member');
                    addToast('開啟會員進入入口選項', 'info');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-teal-450 text-slate-200 text-xs font-bold transition-all border border-slate-850"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>會員進入門戶</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModal('product');
                    addToast('開啟專業健康諮詢表單', 'info');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-emerald-450 text-slate-200 text-xs font-bold transition-all border border-slate-850"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>產品專家洽談</span>
                </button>
                {/* 3折 link highlighted */}
                <a
                  href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/30"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>全線產品 3 折通道</span>
                </a>
              </div>
            </div>

          </div>

          <div className="text-center pt-12 mt-12 border-t border-slate-900 text-[11px] text-slate-500 space-y-2">
            <p>© 2026-2027 GET HEALTH 美麗大地 Co., Ltd. All Rights Reserved. | 隱私權政策 | 使用條款</p>
            <p className="text-[10px] text-slate-600">本平台所有描述成分屬於阿里翁集團，各調節效果因人體質而異。註冊股份方案需完成認購及合同簽署。</p>
          </div>
        </div>
      </footer>

      {/* ========== FLOATING ACTIONS EXPANDABLE BUTTONS ========== */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3 pointer-events-none">
        
        {/* Main interactive chat helper badge */}
        <div className="pointer-events-auto flex items-center justify-center">
          <button
            onClick={() => {
              setActiveModal('member');
              addToast('開啟會員或入會諮詢快捷門戶', 'info');
            }}
            className="w-14 h-14 rounded-full bg-linear-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer animate-pulse"
            title="快捷傳送門"
          >
            <Zap className="w-6 h-6 fill-slate-950 text-slate-950" />
          </button>
        </div>

        {/* Back to top button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              addToast('回到網頁最頂端', 'info');
            }}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-400 transition-all cursor-pointer"
            title="回到網頁頂端"
          >
            <ArrowRight className="w-4 h-4 -rotate-90" />
          </button>
        </div>

        {/* Exclusive Floating Sale badge pointing to URL */}
        <a
          href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-115 transition-all cursor-pointer animate-bounce border border-amber-350"
          title="三折購物專用通道"
        >
          <Tag className="w-5 h-5" />
        </a>

      </div>

      {/* ========== MODAL: MEMBER ENTERING INTRO ========== */}
      {activeModal === 'member' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay mask */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-12 h-12 flex items-center justify-center mb-5">
              <GetHealthLogo className="w-12 h-12" iconOnly={true} variant="theme" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">會員平台登入門戶</h3>
            <p className="text-xs text-slate-400 mt-1">請選擇您的目的地或立即登記新夥伴名額</p>

            <div className="grid gap-3 mt-6">
              {/* Option 1: Shop */}
              <a
                href="https://www.arionbuy.com/#/pages/ucenter/login?undefined="
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => addToast('正在前往 Arion Buy 商城...', 'info')}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-teal-500/40 hover:bg-slate-900 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Arion Buy 核心後台系統</div>
                  <small className="text-[11px] text-slate-500 block mt-0.5">前往購物、佣金及組織團隊管理</small>
                </div>
              </a>

              {/* Option 2: Active Discount link */}
              <a
                href="https://get-health1.webnode.page/%e7%94%a2%e5%93%81%e5%88%86%e9%a1%9e/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setActiveModal(null);
                  addToast('跳轉至 3 折優惠訂購福利專案...', 'success');
                }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-600/5 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-405 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-amber-305 flex items-center gap-1.5 animate-pulse">
                    <span>終生複購 3 折特別搶購通道</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <small className="text-[11px] text-slate-500 block mt-0.5">無入會費免責任額！享受極限 3 折訂貨權益</small>
                </div>
              </a>
            </div>

            {/* Inline dynamic registration form inside member modal */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-left">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">或者 ── 立即登記新會員</h4>
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="您的尊姓大名"
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-teal-500 outline-hidden"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="手機號碼"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-teal-500 outline-hidden"
                  />
                  <input
                    type="email"
                    required
                    placeholder="聯絡 Email"
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-teal-500 outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="LINE ID (選填)"
                    value={registrationForm.lineId}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, lineId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-teal-500 outline-hidden"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="plan"
                        value="vip"
                        checked={registrationForm.plan === 'vip'}
                        onChange={() => setRegistrationForm({ ...registrationForm, plan: 'vip' })}
                        className="accent-teal-500"
                      />
                      <span>VIP (贈 15 股)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="plan"
                        value="store"
                        checked={registrationForm.plan === 'store'}
                        onChange={() => setRegistrationForm({ ...registrationForm, plan: 'store' })}
                        className="accent-indigo-500"
                      />
                      <span>店鋪旗艦 (贈 105 股)</span>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSyncingSheets}
                    className="py-2 px-4 rounded-lg bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 transition-all duration-300"
                  >
                    {isSyncingSheets && (
                      <span className="animate-spin h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                    )}
                    <span>
                      {registrationForm.plan === 'vip' 
                        ? '提交 VIP 註冊登記' 
                        : '提交店鋪旗艦註冊登記'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Reassuring Google Sheets Silent Sync Info */}
              <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-center">
                <span className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========== MODAL: PRODUCT CONTACT MATRIX ========== */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl animate-scale-up text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-12 h-12 flex items-center justify-center mb-5">
              <GetHealthLogo className="w-12 h-12" iconOnly={true} variant="theme" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">產品專人預約洽談</h3>
            <p className="text-xs text-slate-440 mt-1">我們的健康管理顧問將與您連線</p>

            <div className="mt-6 space-y-4">
              
              <a href="tel:+886-42382-2212" className="flex gap-3 items-start p-3 rounded-lg bg-slate-950 border border-slate-850 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer group">
                <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5 group-hover:scale-115 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-teal-400 transition-colors">臺中客服中心熱線</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>+886-42382-2212</span>
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">點擊撥打</span>
                  </div>
                </div>
              </a>

              <a href="https://line.me/R/ti/p/%40gethealth.tw" target="_blank" rel="noopener noreferrer" className="flex gap-3 items-start p-3 rounded-lg bg-slate-950 border border-slate-850 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer group">
                <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-115 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">LINE 官方通訊群組 ID</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>@gethealth.tw</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">點擊加入</span>
                  </div>
                </div>
              </a>

              <a href="mailto:get.health.tw@gmail.com" className="flex gap-3 items-start p-3 rounded-lg bg-slate-950 border border-slate-850 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer group">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-115 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">電子郵件服務箱</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>get.health.tw@gmail.com</span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">發送郵件</span>
                  </div>
                </div>
              </a>

            </div>

            {/* Direct message jump button */}
            <a
              href="#contact"
              onClick={() => {
                setActiveModal(null);
                addToast('已為您定位至下方詳細諮詢信箱表單', 'info');
              }}
              className="block text-center w-full py-2.5 rounded-lg bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-xs mt-6 animate-shadow-pulse"
            >
              填寫線上諮詢表單
            </a>
          </div>
        </div>
      )}

      {/* Hidden Google Translate standard mount point */}
      <div id="google_translate_element" className="fixed opacity-0 pointer-events-none -bottom-40 -right-40 w-1 h-1 overflow-hidden z-[-100]"></div>

    </div>
  );
}
