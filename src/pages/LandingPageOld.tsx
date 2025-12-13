/**
 * Klyr Landing Page - Identity & Payment Infrastructure
 * Modern design for identity verification and payment platform
 */

import { useState, useEffect } from "react";
import {
  Layers,
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
  Square
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  // Scroll reveal animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
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

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-slate-900">Klyr</span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowProductsDropdown(true)}
                onMouseLeave={() => setShowProductsDropdown(false)}
              >
                <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                  Products <ChevronDown className="w-3 h-3" />
                </button>
                {showProductsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-slide-up">
                    <button onClick={() => navigate('/transactions')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Payments</div>
                          <div className="text-xs text-slate-500">Accept global payments</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/payouts')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Send className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Payouts</div>
                          <div className="text-xs text-slate-500">Send funds globally</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/business')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Business Accounts</div>
                          <div className="text-xs text-slate-500">Multi-currency accounts</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/billing')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Billing</div>
                          <div className="text-xs text-slate-500">Subscription management</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Solutions Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowSolutionsDropdown(true)}
                onMouseLeave={() => setShowSolutionsDropdown(false)}
              >
                <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                  Solutions <ChevronDown className="w-3 h-3" />
                </button>
                {showSolutionsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-slide-up">
                    <button onClick={() => navigate('/customers')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Customer Management</div>
                          <div className="text-xs text-slate-500">Manage your customers</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/compliance')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Compliance</div>
                          <div className="text-xs text-slate-500">KYC & AML tools</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/reports')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Reports</div>
                          <div className="text-xs text-slate-500">Analytics & insights</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/integrations')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Integrations</div>
                          <div className="text-xs text-slate-500">Connect your tools</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Developers Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowDevelopersDropdown(true)}
                onMouseLeave={() => setShowDevelopersDropdown(false)}
              >
                <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                  Developers <ChevronDown className="w-3 h-3" />
                </button>
                {showDevelopersDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-slide-up">
                    <button onClick={() => navigate('/dev')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Code className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Documentation</div>
                          <div className="text-xs text-slate-500">API reference & guides</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/api-test')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Terminal className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">API Playground</div>
                          <div className="text-xs text-slate-500">Test API endpoints</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/checkout-demo')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Rocket className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Checkout Demo</div>
                          <div className="text-xs text-slate-500">Try our checkout widget</div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => navigate('/help')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Support</div>
                          <div className="text-xs text-slate-500">Get help & resources</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/multi-step-checkout")}
              className="text-sm font-medium bg-purple-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              See a demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Hero Content */}
            <div className="max-w-2xl">
              <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.1] mb-6">
                The financial <br />
                infrastructure for <br />
                <span className="text-teal-600">blockchain payments</span>
              </h1>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                Accept USDC globally. Settle in seconds. Developer-first API for the next generation of merchants. Open a sandbox account today.
              </p>

              <form className="max-w-md w-full mb-6" onSubmit={(e) => { e.preventDefault(); navigate("/auth"); }}>
                <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                  <input
                    type="email"
                    placeholder="developer@company.com"
                    className="flex-1 px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400 bg-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2 rounded-md transition-colors whitespace-nowrap"
                  >
                    Get API Keys
                  </button>
                </div>
              </form>

              <div className="flex items-start gap-3">
                <div className="mt-1 relative flex items-center justify-center w-4 h-4 rounded border border-teal-600 bg-teal-50">
                  <Check className="w-3 h-3 text-teal-600" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I consent to receiving API updates and sandbox credentials from Klyr. <br />
                  Unsubscribe at any time.
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-12 lg:mt-0 select-none pointer-events-none">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

              {/* Phone Mockup */}
              <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[40px] shadow-2xl p-3 border-4 border-slate-800 animate-float z-10">
                <div className="w-full h-full bg-slate-50 rounded-[32px] overflow-hidden flex flex-col relative">
                  <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-5">
                    <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                    <div className="w-20 h-3 bg-slate-100 rounded-full"></div>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs text-slate-400 font-medium">TOTAL BALANCE</div>
                      <div className="text-3xl font-semibold text-slate-900">$12,450.00</div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-mono rounded border border-teal-100">ON-CHAIN</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded border border-slate-200">OFF-CHAIN</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Recent Activity</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Payment Received</div>
                            <div className="text-[10px] text-slate-400 font-mono">tx_8a92...b91</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-emerald-600">+ $450.00</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Payout to Bank</div>
                            <div className="text-[10px] text-slate-400 font-mono">wd_2c11...4a2</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-900">- $1,200.00</div>
                      </div>
                       <div className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Subscription</div>
                            <div className="text-[10px] text-slate-400 font-mono">sub_99...21</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-900">+ $29.00</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto h-16 border-t border-slate-100 flex items-center justify-around text-slate-300">
                    <div className="w-5 h-5 bg-slate-200 rounded-sm"></div>
                    <div className="w-5 h-5 bg-teal-500 rounded-full shadow-lg shadow-teal-500/40"></div>
                    <div className="w-5 h-5 bg-slate-200 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Floating Payout Card */}
              <div className="absolute bottom-32 -right-8 lg:-right-16 bg-white rounded-xl shadow-lg border border-slate-100 p-5 w-64 animate-float-delayed z-20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">PAYOUT ESTIMATE</div>
                    <div className="text-lg font-semibold text-slate-900">~2.1s</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[92%]"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                  <span>USDC → USD</span>
                  <span>Network: Solana</span>
                </div>
              </div>

              {/* Floating Code Card */}
              <div className="absolute top-20 -left-6 lg:-left-20 bg-white rounded-xl shadow-lg border border-slate-100 p-4 w-auto animate-float z-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <Code2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="font-mono text-xs text-slate-600">
                    <span className="text-teal-600">await</span> klyr.charge({'{'}<br />
                    &nbsp;&nbsp;amount: <span className="text-emerald-600">100</span>,<br />
                    &nbsp;&nbsp;currency: <span className="text-orange-500">'USDC'</span><br />
                    {'}'});
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logo Wall */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8">POWERING NEXT-GEN COMMERCE</p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Triangle className="fill-current" /> Vercel
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800 italic">Stripe</div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Hexagon className="fill-current" /> Rippling
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Infinity className="fill-current" /> Linear
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800 tracking-tighter">COINBASE</div>
          </div>
        </div>
      </section>

      {/* Headline Center Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Gain a competitive edge with Klyr
          </h2>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-3xl mx-auto">
            Partner with a modern platform that removes friction and enables your business to realize its full potential.
            Wave goodbye to costly SWIFT fees, slow outdated settlements, and poor conversion. And, say hello to instant
            finality, global reach, and revenue growth.
          </p>
        </div>
      </section>

      {/* Feature Split 1 - Dashboard Collage */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Visual Dashboard Collage */}
            <div className="relative h-[450px] w-full select-none">
              {/* Background Blob */}
              <div className="absolute inset-0 bg-slate-50 rounded-3xl -z-10 transform -rotate-2 scale-105"></div>

              {/* Back Card: Chart */}
              <div className="absolute top-4 left-4 right-16 bg-white border border-slate-200 rounded-xl shadow-sm p-5 z-10 transition-transform hover:-translate-y-1 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-semibold text-slate-900">Cash balances</div>
                  <div className="flex gap-2 text-xs text-slate-400 bg-slate-50 p-1 rounded-md">
                    <span className="px-2 py-0.5 bg-white shadow-sm rounded text-slate-900 font-medium">USD</span>
                    <span className="px-2 py-0.5">USDC</span>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-slate-900 mb-4">
                  $13,821.83 <span className="text-sm font-normal text-slate-400">USD</span>
                </div>
                {/* Chart Simulation */}
                <div className="flex items-end gap-2 h-24 mt-2">
                  <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-purple-600/20 fill-current" preserveAspectRatio="none">
                      <path d="M0 40 L0 30 C 10 25, 20 35, 30 20 C 40 5, 50 15, 60 10 C 70 5, 80 20, 90 15 L 100 10 L 100 40 Z"></path>
                    </svg>
                    <svg viewBox="0 0 100 40" className="absolute top-0 left-0 w-full h-full text-purple-600 stroke-current fill-none" preserveAspectRatio="none" strokeWidth="2">
                      <path d="M0 30 C 10 25, 20 35, 30 20 C 40 5, 50 15, 60 10 C 70 5, 80 20, 90 15 L 100 10"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Side Card: Bills */}
              <div className="absolute top-24 -right-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-20 transition-transform hover:-translate-y-1 duration-500 delay-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-900">Bills</span>
                  <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">+</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-medium text-slate-900">Server Costs</div>
                      <div className="text-[10px] text-slate-400">AWS Inc.</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">$2,450</div>
                  </div>
                  <div className="h-px bg-slate-100 w-full"></div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-medium text-slate-900">Marketing</div>
                      <div className="text-[10px] text-slate-400">Google Ads</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">$850</div>
                  </div>
                </div>
              </div>

              {/* Front Card: Credit Card */}
              <div className="absolute bottom-10 left-10 w-72 h-44 bg-slate-900 rounded-xl shadow-2xl p-6 z-30 flex flex-col justify-between text-white transition-transform hover:-translate-y-2 duration-500 delay-200 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
                  <div className="text-xs font-mono opacity-50">VIRTUAL</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-teal-600 flex items-center justify-center">
                      <Layers className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-sm">Klyr Corporate</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs font-mono opacity-70">**** 4291</div>
                    <div className="font-bold italic text-lg opacity-90">VISA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
                All you need to do business, <br />
                locally and globally
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Avoid the pain of managing payments and finances across multiple disconnected crypto wallets and bank accounts.
                With Klyr, you get a single unified platform, engineered with all the powerful features you need to streamline
                and future-proof your business growth.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split 2 - Payment Interface */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
                Radically save time and cost <br />
                every single day
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Experience remarkable speed and efficiency. Accept payments in stablecoins, make high-speed blockchain transfers,
                and safeguard profits with like-for-like settlement. Access to interbank FX rates when off-ramping, and no hidden
                charges on corporate expenses.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                Get started
              </button>
            </div>

            {/* Visual Payment Interface */}
            <div className="relative h-[450px] w-full flex items-center justify-center lg:justify-end order-1 lg:order-2 select-none">
              {/* Background Blob */}
              <div className="absolute right-0 top-10 bottom-10 w-3/4 bg-slate-50 rounded-3xl -z-10"></div>

              {/* Payment Widget */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 w-full max-w-sm relative z-20">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900">Send money</h3>
                </div>

                <div className="space-y-4">
                  {/* Input 1 */}
                  <div className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                    <label className="text-xs text-slate-500 font-medium mb-1 block">You pay</label>
                    <div className="flex items-center justify-between">
                      <input type="text" value="25,000" className="w-full text-xl font-semibold text-slate-900 outline-none" readOnly />
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">US</div>
                        <span className="text-sm font-medium text-slate-700">USDC</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Conversion Info */}
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center bg-white text-purple-600">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <div className="text-[10px] font-mono text-slate-400">1 USDC ≈ 1.00 USD</div>
                  </div>

                  {/* Input 2 */}
                  <div className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                    <label className="text-xs text-slate-500 font-medium mb-1 block">Recipient gets</label>
                    <div className="flex items-center justify-between">
                      <input type="text" value="25,000.00" className="w-full text-xl font-semibold text-slate-900 outline-none" readOnly />
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold">$</div>
                        <span className="text-sm font-medium text-slate-700">USD</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Info Rows */}
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Transfer fee
                      </span>
                      <span className="font-medium text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Arrival</span>
                      <span className="font-medium text-slate-900">~ 2 seconds</span>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg text-sm mt-2 hover:bg-purple-700 transition-colors shadow-md">
                    Continue
                  </button>
                </div>
              </div>

              {/* Floating Balances Widget */}
              <div className="absolute -right-4 lg:-right-12 top-20 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-56 hidden md:block z-30 animate-float">
                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Balances</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">🇺🇸</div>
                      <div className="text-xs font-bold text-slate-900">USD</div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">$52,982.68</div>
                  </div>
                  <div className="h-px bg-slate-50"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">🇪🇺</div>
                      <div className="text-xs font-bold text-slate-900">EUR</div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">€20,120.81</div>
                  </div>
                  <div className="h-px bg-slate-50"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs text-blue-600 font-bold">C</div>
                      <div className="text-xs font-bold text-slate-900">USDC</div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">$102,451.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Cards Grid Section */}
      <section className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Why Klyr?</div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6">Engineered for growth</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Card 1 - Accounts */}
            <button onClick={() => navigate('/business')} className="group relative overflow-hidden rounded-2xl bg-orange-500 text-white p-6 h-[400px] flex flex-col transition-all hover:-translate-y-2 duration-300 cursor-pointer text-left">
              <div className="mb-5"><LayoutGrid className="w-6 h-6" /></div>
              <h3 className="text-xl font-semibold mb-2">Accounts</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Streamline your payments and finances</p>
              <div className="mt-auto mb-10"><ArrowRight className="w-4 h-4" /></div>
              <div className="absolute -bottom-14 left-6 right-6 bg-white rounded-t-xl h-40 p-3 shadow-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                  <div className="space-y-1">
                    <div className="w-16 h-1.5 bg-slate-100 rounded"></div>
                    <div className="w-10 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="w-full h-1.5 bg-slate-50 rounded"></div>
                  <div className="w-full h-1.5 bg-slate-50 rounded"></div>
                  <div className="w-2/3 h-1.5 bg-slate-50 rounded"></div>
                </div>
              </div>
            </button>

            {/* Card 2 - Spend */}
            <button onClick={() => navigate('/transactions')} className="group relative overflow-hidden rounded-2xl bg-purple-600 text-white p-6 h-[400px] flex flex-col transition-all hover:-translate-y-2 duration-300 cursor-pointer text-left">
              <div className="mb-5"><CreditCard className="w-6 h-6" /></div>
              <h3 className="text-xl font-semibold mb-2">Spend</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Manage company spend, end-to-end</p>
              <div className="mt-auto mb-10"><ArrowRight className="w-4 h-4" /></div>
              <div className="absolute -bottom-12 left-6 right-6 bg-white rounded-t-xl h-40 p-4 shadow-lg flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-2">$</div>
                <div className="text-lg font-bold text-slate-900">$29.01</div>
                <div className="text-[10px] text-slate-400">Ready to review</div>
              </div>
            </button>

            {/* Card 3 - Payments */}
            <button onClick={() => navigate('/checkout-demo')} className="group relative overflow-hidden rounded-2xl bg-blue-600 text-white p-6 h-[400px] flex flex-col transition-all hover:-translate-y-2 duration-300 cursor-pointer text-left">
              <div className="mb-5"><ArrowLeftRight className="w-6 h-6" /></div>
              <h3 className="text-xl font-semibold mb-2">Payments</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Accept global payments like a local</p>
              <div className="mt-auto mb-10"><ArrowRight className="w-4 h-4" /></div>
              <div className="absolute -bottom-16 left-5 right-5 bg-white rounded-t-xl h-48 p-4 shadow-lg text-slate-900">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-50">
                  <span className="text-[10px] font-semibold text-slate-500">Order summary</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Total</span>
                    <span className="font-medium">$10.83</span>
                  </div>
                </div>
                <div className="mt-4 w-full h-6 bg-slate-900 rounded text-white text-[10px] flex items-center justify-center">Pay</div>
              </div>
            </button>

            {/* Card 4 - Billing */}
            <button onClick={() => navigate('/billing')} className="group relative overflow-hidden rounded-2xl bg-sky-500 text-white p-6 h-[400px] flex flex-col transition-all hover:-translate-y-2 duration-300 cursor-pointer text-left">
              <div className="mb-5"><FileText className="w-6 h-4" /></div>
              <h3 className="text-xl font-semibold mb-2">Billing</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Maximise your global revenue with billing</p>
              <div className="mt-auto mb-10"><ArrowRight className="w-4 h-4" /></div>
              <div className="absolute -bottom-12 left-6 right-6 bg-white rounded-t-xl h-40 p-3 shadow-lg">
                <div className="flex gap-2 mb-3">
                  <div className="w-full h-8 bg-slate-50 border border-slate-100 rounded flex items-center px-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    <div className="w-12 h-1 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-slate-50 rounded border border-slate-100"></div>
                  <div className="h-16 bg-slate-50 rounded border border-slate-100"></div>
                </div>
              </div>
            </button>

            {/* Card 5 - API */}
            <button onClick={() => navigate('/dev')} className="group relative overflow-hidden rounded-2xl bg-pink-600 text-white p-6 h-[400px] flex flex-col transition-all hover:-translate-y-2 duration-300 cursor-pointer text-left">
              <div className="mb-5"><TerminalSquare className="w-6 h-6" /></div>
              <h3 className="text-xl font-semibold mb-2">API</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-4">Build powerful financial solutions</p>
              <div className="mt-auto mb-10"><ArrowRight className="w-4 h-4" /></div>
              <div className="absolute -bottom-8 left-4 right-4 bg-slate-800 rounded-t-xl h-40 p-4 shadow-2xl font-mono text-[10px] leading-relaxed border border-slate-700">
                <div className="text-purple-400">import</div>
                <div className="pl-2 text-blue-300">{'{ klyr }'}</div>
                <div className="text-purple-400">from</div>
                <div className="pl-2 text-green-400">'@klyr/sdk'</div>
                <div className="mt-2 text-slate-500">// init</div>
              </div>
            </button>
          </div>
        </div>
      </section>


      {/* Dark Universe Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-semibold tracking-tight mb-4">Your financial universe on one platform</h2>
            <p className="text-slate-400 text-lg">
              Software and APIs to manage everything from business accounts, spend, and payments to embedded finance.
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <div className="inline-flex items-center bg-slate-800/50 rounded-full p-1.5 border border-slate-700/50 backdrop-blur-sm">
              <button className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-medium shadow-lg transition-all">
                Business Accounts
              </button>
              <button className="px-5 py-2 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-colors">Spend</button>
              <button className="px-5 py-2 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-colors">Payments</button>
              <button className="px-5 py-2 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-colors">Billing</button>
              <button className="px-5 py-2 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-colors">Platform APIs</button>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4 p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Business Accounts</div>
                <h3 className="text-3xl font-semibold mb-4 tracking-tight">A single global account</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Open accounts in seconds. Hold, convert and send 50+ currencies and stablecoins without leaving the dashboard.
                </p>
              </div>
              <div className="mt-8 bg-white rounded-lg p-4 h-48 relative overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">US</div>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-xs">USD Account</div>
                    <div className="text-slate-500 text-[10px]">**** 4291</div>
                  </div>
                  <div className="text-slate-900 font-bold text-xs">$24,000</div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">EU</div>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-xs">EUR Account</div>
                    <div className="text-slate-500 text-[10px]">**** 8821</div>
                  </div>
                  <div className="text-slate-900 font-bold text-xs">€12,450</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex flex-col min-h-[400px] relative overflow-hidden">
              <div className="relative z-10 max-w-lg">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Transfers</div>
                <h3 className="text-3xl font-semibold mb-4 tracking-tight">High-speed global settlement</h3>
                <p className="text-slate-400 leading-relaxed text-sm mb-8">
                  Connect to local payment rails in 100+ countries. Settle funds instantly via blockchain or T+1 via local bank transfer.
                </p>
                <button onClick={() => navigate('/business')} className="inline-flex items-center gap-2 text-orange-500 font-medium text-sm hover:gap-3 transition-all">
                  Learn more about accounts <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-12 md:mt-0 md:absolute md:bottom-8 md:right-8 w-full md:w-80 bg-white rounded-lg p-5 shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-slate-900 font-semibold text-sm">Transfer Status</div>
                  <div className="text-emerald-600 text-[10px] font-mono bg-emerald-50 px-2 py-1 rounded">Completed</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Amount</span>
                    <span className="text-slate-900 font-medium">$5,000.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Fee</span>
                    <span className="text-slate-900 font-medium">$0.00</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white">
                <Layers className="w-3 h-3" />
              </div>
              <span className="font-semibold text-lg text-slate-900">Klyr</span>
            </a>
            <p className="text-slate-500 text-sm max-w-xs mb-6">
              The financial infrastructure platform for the blockchain era. San Francisco, CA.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-600"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-600"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-600"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><button onClick={() => navigate('/transactions')} className="hover:text-teal-600 transition-colors">Payments</button></li>
              <li><button onClick={() => navigate('/payouts')} className="hover:text-teal-600 transition-colors">Payouts</button></li>
              <li><button onClick={() => navigate('/integrations')} className="hover:text-teal-600 transition-colors">Connect</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-teal-600 transition-colors">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-4 text-sm">Developers</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><button onClick={() => navigate('/dev')} className="hover:text-teal-600 transition-colors">Documentation</button></li>
              <li><button onClick={() => navigate('/api-test')} className="hover:text-teal-600 transition-colors">API Reference</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-teal-600 transition-colors">Status</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-teal-600 transition-colors">Sandbox</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-teal-600 transition-colors">About</button></li>
              <li><button onClick={() => navigate('/customers')} className="hover:text-teal-600 transition-colors">Customers</button></li>
              <li><button onClick={() => navigate('/reports')} className="hover:text-teal-600 transition-colors">Blog</button></li>
              <li><button onClick={() => navigate('/team')} className="hover:text-teal-600 transition-colors">Careers</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Klyr Inc. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}