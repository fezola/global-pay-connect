/**
 * Klyr Landing Page - Identity & Payment Infrastructure
 * Modern design for identity verification and payment platform
 */

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ArrowRight,
  ScanFace,
  Smile,
  Share2,
  FolderLock,
  Smartphone,
  ShoppingCart,
  Shield,
  GitBranch,
  Zap,
  LayoutTemplate,
  CheckCircle2,
  Check,
  Globe,
  Lock,
  Code2,
  Twitter,
  Github,
  Linkedin,
  ArrowUpRight,
  Box,
  Triangle,
  Circle,
  Hexagon,
  Square,
  Wallet,
  Coins,
  Building2,
  Layers,
  Diamond,
  Sparkles,
  Package,
  Store,
  Truck,
  Tag,
  CreditCard,
  ShoppingBag,
  Rocket,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Enhanced scroll reveal animation and effects
  useEffect(() => {
    // Intersection Observer for scroll reveal animations
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Bento grid scroll animation
    const bentoContainer = document.getElementById('bento-container');
    let lastScrollY = window.scrollY;

    // Parallax effect for hero section
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

      // Update scroll progress bar
      const scrollProgress = document.getElementById('scroll-progress');
      if (scrollProgress) {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (scrollY / windowHeight) * 100;
        scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
      }

      // Parallax effect on hero elements
      const heroElements = document.querySelectorAll('.parallax');
      heroElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
        const yPos = -(scrollY * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });

      // Bento grid horizontal scroll effect
      if (bentoContainer) {
        const containerRect = bentoContainer.getBoundingClientRect();
        const containerTop = containerRect.top + scrollY;
        const scrollProgress = (scrollY - containerTop + window.innerHeight) / (containerRect.height + window.innerHeight);

        // Apply horizontal layout when scrolling up and in view
        if (scrollDirection === 'up' && scrollProgress > 0.3 && scrollProgress < 1.2) {
          bentoContainer.classList.add('horizontal-layout');
        } else if (scrollDirection === 'down' || scrollProgress <= 0.3 || scrollProgress >= 1.2) {
          bentoContainer.classList.remove('horizontal-layout');
        }
      }

      // Navbar background on scroll
      const navbar = document.querySelector('nav');
      if (navbar) {
        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Show/hide scroll to top button
      const scrollToTopBtn = document.getElementById('scroll-to-top');
      if (scrollToTopBtn) {
        if (scrollY > 300) {
          scrollToTopBtn.style.opacity = '1';
          scrollToTopBtn.style.pointerEvents = 'auto';
        } else {
          scrollToTopBtn.style.opacity = '0';
          scrollToTopBtn.style.pointerEvents = 'none';
        }
      }

      lastScrollY = scrollY;
    };

    // Smooth scroll for anchor links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    // Throttle scroll event for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initial call
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-[100]">
        <div
          id="scroll-progress"
          className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 transition-all duration-150"
          style={{ width: '0%' }}
        ></div>
      </div>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .bento-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .bento-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .bento-card:hover::before {
          opacity: 1;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Horizontal layout animation */
        #bento-container {
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #bento-container.horizontal-layout {
          padding: 3rem 2rem !important;
        }
        #bento-container.horizontal-layout .bento-grid-main {
          display: flex !important;
          flex-direction: row !important;
          gap: 1.5rem !important;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 1rem;
        }
        #bento-container.horizontal-layout .bento-grid-main > * {
          flex: 0 0 auto !important;
          width: 280px !important;
          height: 320px !important;
          scroll-snap-align: start;
        }
        #bento-container.horizontal-layout .bento-bottom-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 1.5rem !important;
          margin-top: 1.5rem !important;
          width: 100% !important;
        }
        #bento-container.horizontal-layout .bento-bottom-row > * {
          flex: 1 !important;
          min-width: 200px !important;
        }
      `}</style>

      {/* Dropdown Backdrop */}
      {activeDropdown && (
        <div
          className="dropdown-backdrop"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* ========== HEADER / NAVIGATION ========== */}
      <header>
        <nav className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-transparent transition-all duration-300">
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo & Primary Navigation */}
            <div className="flex items-center gap-10">
              <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
                <div className="w-8 h-8 text-slate-900">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"></path>
                  </svg>
                </div>
                <span className="font-semibold text-xl tracking-tight text-slate-900">Klyr</span>
              </button>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                {/* Products Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('products')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2">
                    Products
                    <ChevronDown className={`w-3.5 h-3.5 mt-0.5 opacity-50 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Products Mega Dropdown */}
                  {activeDropdown === 'products' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 w-[600px]">
                        {/* BY STAGE */}
                        <div className="mb-8">
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">By Stage</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate("/business")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Building2 className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Enterprises</div>
                                <div className="text-xs text-slate-500">For large organizations</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/business")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Rocket className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Startups</div>
                                <div className="text-xs text-slate-500">For growing companies</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* BY USE CASE */}
                        <div className="mb-8">
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">By Use Case</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <ShoppingCart className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">E-commerce</div>
                                <div className="text-xs text-slate-500">Online store payments</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Globe className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Global businesses</div>
                                <div className="text-xs text-slate-500">Cross-border payments</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Smartphone className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">In-app payments</div>
                                <div className="text-xs text-slate-500">Mobile integration</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Store className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Marketplaces</div>
                                <div className="text-xs text-slate-500">Multi-vendor platforms</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Users className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Platforms</div>
                                <div className="text-xs text-slate-500">SaaS & subscriptions</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Finance automation</div>
                                <div className="text-xs text-slate-500">Automated workflows</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* ECOSYSTEM */}
                        <div className="pt-6 border-t border-slate-100">
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate("/dev")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Package className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5 flex items-center gap-2">
                                  App Marketplace
                                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-xs text-slate-500">Extend functionality</div>
                              </div>
                            </button>
                            <button onClick={() => navigate("/help")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                              <Users className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-slate-900 transition-colors" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900 mb-0.5">Partners</div>
                                <div className="text-xs text-slate-500">Integration partners</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Solutions Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('solutions')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2">
                    Solutions
                    <ChevronDown className={`w-3.5 h-3.5 mt-0.5 opacity-50 transition-transform ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Solutions Dropdown */}
                  {activeDropdown === 'solutions' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-[400px]">
                        <div className="space-y-2">
                          <button onClick={() => navigate("/compliance")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <Shield className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Compliance & Security</div>
                              <div className="text-xs text-slate-500">SOC2, PCI-DSS certified</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/dev")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <Code2 className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Developer Tools</div>
                              <div className="text-xs text-slate-500">APIs, SDKs, webhooks</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/transactions")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <DollarSign className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Payment Processing</div>
                              <div className="text-xs text-slate-500">Accept crypto globally</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/business")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Analytics & Reporting</div>
                              <div className="text-xs text-slate-500">Real-time insights</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => navigate("/business")} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Customers
                </button>
                <button onClick={() => navigate("/multi-step-checkout")} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Pricing
                </button>

                {/* Resources Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('resources')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2">
                    Resources
                    <ChevronDown className={`w-3.5 h-3.5 mt-0.5 opacity-50 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Resources Dropdown */}
                  {activeDropdown === 'resources' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-[400px]">
                        <div className="space-y-2">
                          <button onClick={() => navigate("/dev")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Documentation</div>
                              <div className="text-xs text-slate-500">Start integrating products</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/dev")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <Code2 className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">API Reference</div>
                              <div className="text-xs text-slate-500">Complete API docs</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/help")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <FileText className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Guides</div>
                              <div className="text-xs text-slate-500">Implementation guides</div>
                            </div>
                          </button>
                          <button onClick={() => navigate("/business")} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group w-full">
                            <Lightbulb className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-teal-600 transition-colors" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-0.5">Case Studies</div>
                              <div className="text-xs text-slate-500">Customer success stories</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/auth")} className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition-colors">
                Log in
              </button>
              <button onClick={() => navigate("/multi-step-checkout")} className="text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full transition-all flex items-center gap-2 group">
                Get a demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main>
        {/* Hero Section */}
        <section className="pt-16 pb-24 px-6 relative">
          <div className="max-w-[1400px] mx-auto">

            {/* Hero Text Content */}
            <div className="text-center max-w-4xl mx-auto mb-16 reveal active z-10 relative">
              {/* Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-8 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>New: Multi-chain settlement available now</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.1] mb-8 animate-fadeIn stagger-1">
                The financial infrastructure <br className="hidden md:block" />
                for blockchain payments
              </h1>

              {/* Hero Description */}
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fadeIn stagger-2">
                Accept <span className="text-teal-600 font-medium">USDC globally</span>. Settle in seconds. Developer-first API for the next generation of merchants. <span className="underline decoration-slate-300 underline-offset-4">Open a sandbox account today</span>.
              </p>

              {/* Hero CTA */}
              <div className="flex items-center justify-center gap-4 animate-fadeIn stagger-3">
                <button onClick={() => navigate("/auth")} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate("/multi-step-checkout")} className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-medium hover:bg-slate-50 hover:scale-105 transition-all shadow-sm hover:shadow-md">
                  See a demo
                </button>
              </div>
            </div>

            {/* Hero Visual - Bento Grid */}
            <div id="bento-container" className="w-full bg-[#022c22] rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden reveal delay-200 shadow-2xl">
              {/* Decorative Background Elements with Parallax */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none parallax animate-float" data-speed="0.3"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none parallax animate-float-delayed" data-speed="0.2"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none parallax" data-speed="0.4"></div>

              {/* Bento Grid Container */}
              <div className="bento-grid-main grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 relative z-10 h-full min-h-[500px]">

                {/* Feature Card: USDC Payments */}
                <div className="md:col-span-3 lg:col-span-4 bg-[#6ee7b7] rounded-3xl p-8 flex flex-col justify-between h-64 md:h-auto bento-card group cursor-pointer relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-slate-900">
                      <h3 className="text-lg font-semibold mb-1">Global USDC Payments</h3>
                      <p className="text-slate-800/70 text-sm">Accept stablecoin payments in 190+ countries</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between relative z-10">
                    <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <ScanFace className="w-6 h-6 text-slate-900" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Feature Card: Instant Settlement */}
                <div className="md:col-span-3 lg:col-span-3 bg-[#67e8f9] rounded-3xl p-8 flex flex-col justify-between h-64 md:h-auto bento-card group cursor-pointer relative overflow-hidden mt-0 lg:mt-20">
                  <div className="relative z-10">
                    <div className="text-slate-900">
                      <h3 className="text-lg font-semibold mb-1">Instant Settlement</h3>
                      <p className="text-slate-800/70 text-sm">Real-time blockchain confirmations</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-8 relative z-10">
                    <div className="w-full bg-white/20 rounded-xl h-24 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                      <Smile className="w-8 h-8 text-slate-900 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      <div className="absolute inset-4 border-2 border-dashed border-slate-900/30 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Feature Cards: Graph Link & Transaction Cases */}
                <div className="hidden lg:block lg:col-span-2 space-y-6 pt-10">
                  {/* Graph Link Card */}
                  <div className="bg-[#d8b4fe] rounded-3xl p-6 h-32 flex flex-col justify-center items-center text-center bento-card group cursor-pointer relative overflow-hidden">
                    <Share2 className="w-6 h-6 text-slate-900 mb-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-xs font-semibold text-slate-900">Graph Link</span>
                    <span className="text-[10px] text-slate-700 mt-1">Network analytics</span>
                  </div>
                  {/* Cases Card */}
                  <div className="bg-[#bae6fd] rounded-3xl p-6 h-48 flex flex-col justify-between bento-card group cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                      <FolderLock className="w-6 h-6 text-slate-900 group-hover:scale-110 transition-transform duration-300" />
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="relative z-10">
                      <span className="text-sm font-semibold text-slate-900">Cases</span>
                      <p className="text-[10px] text-slate-700 mt-1">Transaction history</p>
                    </div>
                  </div>
                </div>

                {/* Feature Card: Smart Routing */}
                <div className="md:col-span-6 lg:col-span-3 bg-[#a5b4fc] rounded-3xl p-8 flex flex-col h-full min-h-[280px] bento-card group cursor-pointer relative overflow-hidden">
                  <div className="mb-4 relative z-10">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Smart Routing</h3>
                    <p className="text-slate-900/70 text-sm">Optimized gas fees & network selection</p>
                  </div>
                  <div className="flex-1 relative">
                    {/* Abstract Visualization */}
                    <div className="absolute bottom-0 right-0 left-0 h-32 bg-slate-900/5 rounded-t-xl border-t border-slate-900/10 p-4 space-y-2 backdrop-blur-sm">
                      <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <div className="h-1.5 w-16 bg-slate-900/10 rounded-full"></div>
                        <span className="text-[9px] text-slate-700 ml-auto">Ethereum</span>
                      </div>
                      <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="h-1.5 w-24 bg-slate-900/10 rounded-full"></div>
                        <span className="text-[9px] text-slate-700 ml-auto">Polygon</span>
                      </div>
                      <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <div className="h-1.5 w-12 bg-slate-900/10 rounded-full"></div>
                        <span className="text-[9px] text-slate-700 ml-auto">Arbitrum</span>
                      </div>
                    </div>
                    <Smartphone className="w-6 h-6 text-slate-900 absolute bottom-4 left-4 z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Bottom Feature Cards Row */}
              <div className="bento-bottom-row grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mt-6 lg:w-[80%] mx-auto relative z-10">
                <div className="bg-[#e9d5ff] rounded-2xl p-6 bento-card group cursor-pointer flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Checkout</h3>
                    <p className="text-[10px] text-slate-700">Payment flows</p>
                  </div>
                </div>
                <div className="bg-[#c4b5fd] rounded-2xl p-6 bento-card group cursor-pointer flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Risk AI</h3>
                    <p className="text-[10px] text-slate-700">Fraud detection</p>
                  </div>
                </div>
                <div className="bg-[#6ee7b7] rounded-2xl p-6 bento-card group cursor-pointer flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <GitBranch className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Workflows</h3>
                    <p className="text-[10px] text-slate-700">Automation</p>
                  </div>
                </div>
                <div className="bg-[#fcd34d] rounded-2xl p-6 bento-card group cursor-pointer flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Instant</h3>
                    <p className="text-[10px] text-slate-700">Fast transfers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== TRUSTED BY SECTION ========== */}
        <section className="py-16 border-b border-slate-200 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-center text-xs font-semibold tracking-widest text-slate-400 uppercase mb-12">
              Powering payments for global e-commerce
            </h2>

            {/* Companies Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              {/* AliExpress */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">AliExpress</span>
              </div>

              {/* Amazon */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Amazon</span>
              </div>

              {/* eBay */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">eBay</span>
              </div>

              {/* Etsy */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Etsy</span>
              </div>

              {/* Shopify */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Shopify</span>
              </div>

              {/* Walmart */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Walmart</span>
              </div>

              {/* Wish */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Wish</span>
              </div>

              {/* Rakuten */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Rakuten</span>
              </div>

              {/* Zalando */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Zalando</span>
              </div>

              {/* Wayfair */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Wayfair</span>
              </div>

              {/* Overstock */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Overstock</span>
              </div>

              {/* Newegg */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Newegg</span>
              </div>

              {/* Target */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Target</span>
              </div>

              {/* Best Buy */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Best Buy</span>
              </div>

              {/* Mercado Libre */}
              <div className="flex items-center justify-center text-lg font-bold text-slate-700 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="hover:text-slate-900 transition-colors">Mercado Libre</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== FEATURES SECTION ========== */}
        <section className="py-24 bg-white" id="solutions">
          <div className="max-w-[1400px] mx-auto px-6">
            {/* Section Header */}
            <div className="mb-16 max-w-2xl reveal">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
                A complete blockchain payment platform
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Accept crypto payments, manage settlements, and scale globally with a single integration.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature: Embedded Payment Widget */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] rounded-3xl p-10 border border-emerald-100 hover:border-emerald-200 transition-all group overflow-hidden relative min-h-[420px] reveal delay-100 shadow-sm hover:shadow-xl">
                <div className="relative z-10 max-w-md">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <LayoutTemplate className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">Embedded Payment Widget</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Drop-in checkout components that match your brand. Accept USDC, ETH, and 50+ cryptocurrencies without building custom UI.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                    <Check className="w-4 h-4" />
                    <span>No-code integration</span>
                  </div>
                </div>
                {/* Visual Mockup - Payment Widget */}
                <div className="absolute right-6 bottom-6 w-[45%] h-[75%] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
                      <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <div className="h-12 w-full bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center px-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full mr-2"></div>
                      <div className="h-2 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl"></div>
                    <div className="h-12 w-full bg-slate-900 rounded-xl flex items-center justify-center">
                      <div className="h-2 w-12 bg-white/30 rounded"></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature: Instant Settlement */}
              <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] rounded-3xl p-8 border border-blue-100 hover:border-blue-200 transition-all reveal delay-200 relative overflow-hidden shadow-sm hover:shadow-xl group min-h-[420px] flex flex-col">
                <div className="relative z-10 flex-1">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">Instant Settlement</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Receive funds in seconds, not days. Blockchain confirmations happen in real-time with automatic reconciliation.
                  </p>
                </div>
                {/* Status Badge */}
                <div className="relative z-10 mt-auto">
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">Payment Confirmed</div>
                      <div className="text-[10px] text-slate-500">Settlement in 2.3s</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">$1,250</div>
                  </div>
                </div>
              </div>

              {/* Feature: Multi-Chain Support */}
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-purple-200 hover:shadow-xl transition-all reveal delay-100 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <GitBranch className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Multi-Chain Support</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Accept payments on Ethereum, Polygon, Arbitrum, Optimism, and 15+ networks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">Ethereum</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Polygon</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Arbitrum</span>
                </div>
              </div>

              {/* Feature: Enterprise Security */}
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all reveal delay-200 group">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Enterprise Security</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  SOC2 Type II certified with multi-sig wallets, hardware security modules, and end-to-end encryption.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Bank-grade security</span>
                </div>
              </div>

              {/* Feature: Developer API */}
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-teal-200 hover:shadow-xl transition-all reveal delay-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Code2 className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Developer-First API</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  RESTful API, webhooks, SDKs for Node.js, Python, Go. Comprehensive docs and sandbox environment.
                </p>
                <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
                  <ArrowRight className="w-3 h-3" />
                  <span>View documentation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== DEVELOPER API SECTION ========== */}
        <section className="py-24 bg-[#0f1724] relative overflow-hidden">
          {/* Decorative Border */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              {/* Content Column */}
              <div className="lg:w-1/2 reveal">
                <div className="text-[#6ee7b7] font-mono text-xs mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6ee7b7] animate-pulse"></span>
                  <span>DEVELOPER API</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-white mb-6">
                  Built for scale,<br />designed for speed.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                  Integrate our verification stack in the afternoon, go live the next morning. Our SDKs handle the heavy lifting of image capture and data extraction.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate("/dev")} className="bg-white text-slate-900 px-6 py-3.5 rounded-full font-medium hover:bg-slate-200 transition-colors text-center">
                    Read the docs
                  </button>
                  <button onClick={() => navigate("/dev")} className="text-white border border-slate-700 px-6 py-3.5 rounded-full font-medium hover:bg-slate-800 transition-colors text-center">
                    View API Reference
                  </button>
                </div>
              </div>

              {/* Code Example Column */}
              <div className="lg:w-1/2 w-full reveal delay-200">
                <div className="rounded-2xl bg-[#1e293b] border border-slate-700 overflow-hidden shadow-2xl">
                  {/* Code Editor Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#020617] border-b border-slate-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="font-mono text-xs text-slate-500">verification.js</div>
                  </div>
                  {/* Code Content */}
                  <div className="p-6 overflow-x-auto">
                    <pre className="font-mono text-xs leading-relaxed text-slate-300">
{`const client = new Klyr.Client('sk_live_...');

// Initialize verification session
const inquiry = await client.inquiries.create({
  template_id: 'itmpl_standard_kyc',
  reference_id: 'user_12345',
  redirect_url: 'https://app.klyr.com/callback',
  fields: {
    email: 'user@example.com'
  }
});

// Handle webhook events
client.on('inquiry.completed', (event) => {
  console.log('Verification status:', event.status);
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-[#f0fdf4] rounded-[3rem] p-12 text-center border border-green-100 reveal">
              <h2 className="text-4xl font-medium tracking-tight text-slate-900 mb-6">
                Start verifying in minutes
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                Join thousands of companies using Klyr to securely onboard customers and prevent fraud.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate("/auth")} className="bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Start for free
                </button>
                <button onClick={() => navigate("/multi-step-checkout")} className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full font-medium hover:bg-slate-50 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Footer Main Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-2 pr-12">
              <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 text-slate-900">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"></path>
                  </svg>
                </div>
                <span className="font-semibold text-lg text-slate-900">Klyr</span>
              </button>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                The modern identity infrastructure for the internet. Verify anyone, anywhere, at any time.
              </p>
              {/* Social Links */}
              <div className="flex gap-4">
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <Github className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Platform Links */}
            <nav className="col-span-1">
              <h4 className="font-semibold text-slate-900 mb-6 text-sm">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => navigate("/transactions")} className="hover:text-slate-900 transition-colors">Identity Verification</button></li>
                <li><button onClick={() => navigate("/compliance")} className="hover:text-slate-900 transition-colors">Document Verification</button></li>
                <li><button onClick={() => navigate("/compliance")} className="hover:text-slate-900 transition-colors">AML Screening</button></li>
                <li><button onClick={() => navigate("/security")} className="hover:text-slate-900 transition-colors">Biometric Auth</button></li>
              </ul>
            </nav>

            {/* Resources Links */}
            <nav className="col-span-1">
              <h4 className="font-semibold text-slate-900 mb-6 text-sm">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => navigate("/dev")} className="hover:text-slate-900 transition-colors">Developers</button></li>
                <li><button onClick={() => navigate("/dev")} className="hover:text-slate-900 transition-colors">API Reference</button></li>
                <li><button onClick={() => navigate("/help")} className="hover:text-slate-900 transition-colors">Case Studies</button></li>
                <li><button onClick={() => navigate("/security")} className="hover:text-slate-900 transition-colors">Security</button></li>
              </ul>
            </nav>

            {/* Company Links */}
            <nav className="col-span-1">
              <h4 className="font-semibold text-slate-900 mb-6 text-sm">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => navigate("/business")} className="hover:text-slate-900 transition-colors">About</button></li>
                <li>
                  <button onClick={() => navigate("/team")} className="hover:text-slate-900 transition-colors">Careers</button>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 ml-1">Hiring</span>
                </li>
                <li><button onClick={() => navigate("/help")} className="hover:text-slate-900 transition-colors">Legal</button></li>
                <li><button onClick={() => navigate("/help")} className="hover:text-slate-900 transition-colors">Contact</button></li>
              </ul>
            </nav>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400">© 2025 Klyr Inc. All rights reserved.</p>
            <nav className="flex gap-6 text-xs text-slate-400">
              <button onClick={() => navigate("/help")} className="hover:text-slate-900 transition-colors">Privacy Policy</button>
              <button onClick={() => navigate("/help")} className="hover:text-slate-900 transition-colors">Terms of Service</button>
            </nav>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        id="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center opacity-0 pointer-events-none z-50"
        aria-label="Scroll to top"
      >
        <ChevronDown className="w-5 h-5 rotate-180" />
      </button>
    </div>
  );
}

