/**
 * Klyr Landing Page
 * Modern, bold design inspired by top fintech products
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe2,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Play,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Klyr</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-10">
              <a href="#product" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Product
              </a>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#developers" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Developers
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </a>
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => navigate("/auth")}
              >
                Sign in
              </Button>
              <Button
                className="bg-white text-black hover:bg-gray-200 font-semibold"
                onClick={() => navigate("/auth")}
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu */}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 space-y-4 border-t border-white/10">
              <a href="#product" className="block text-gray-300 hover:text-white py-2">Product</a>
              <a href="#features" className="block text-gray-300 hover:text-white py-2">Features</a>
              <a href="#developers" className="block text-gray-300 hover:text-white py-2">Developers</a>
              <a href="#pricing" className="block text-gray-300 hover:text-white py-2">Pricing</a>
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full border-white/20 text-white" onClick={() => navigate("/auth")}>
                  Sign in
                </Button>
                <Button className="w-full bg-white text-black" onClick={() => navigate("/auth")}>
                  Get started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold">Multi-currency wallets & instant settlement</h3>
            <p className="text-slate-600 mt-4">
              Hold balances in stablecoins or fiat tokens. Route settlement via on-chain liquidity or custodial rails depending on cost and compliance.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-md flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Local receiving accounts</div>
                  <div className="text-slate-600 text-sm">Open local accounts for 30+ currencies.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-600 text-white rounded-md flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Programmable payouts</div>
                  <div className="text-slate-600 text-sm">Split revenue instantly across teams and partners.</div>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <div className="bg-gradient-to-br from-violet-100 to-teal-100 rounded-2xl p-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-teal-500" />
                  <span className="font-semibold">Instant Settlement</span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Processing time</span>
                    <span className="font-medium text-slate-900">0.8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success rate</span>
                    <span className="font-medium text-green-600">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average cost</span>
                    <span className="font-medium text-slate-900">0.10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section id="product" className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              One integration.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                Five blockchains.
              </span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Support for the most popular blockchain networks with the lowest fees.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: 'Solana', logo: '/solana-sol-logo.svg', fee: '$0.0001' },
              { name: 'Base', logo: '/base.png', fee: '$0.01' },
              { name: 'Polygon', logo: '/polygon-matic-logo.svg', fee: '$0.01' },
              { name: 'Arbitrum', logo: '/arbitrum-arb-logo.svg', fee: '$0.10' },
              { name: 'Optimism', logo: '/optimism-ethereum-op-logo.svg', fee: '$0.10' },
            ].map((network, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 transition-all text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet-100 to-teal-100 p-3 flex items-center justify-center">
                  <img src={network.logo} alt={network.name} className="w-10 h-10 object-contain" />
                </div>
                <h3 className="font-semibold mb-1">{network.name}</h3>
                <p className="text-sm text-green-600 font-medium">{network.fee} fee</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="developers" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Developer{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                  experience first
                </span>
              </h2>
              <p className="text-slate-600 mb-10">
                Simple, powerful APIs. Get started in minutes with our React components or REST API.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">React Components</div>
                    <div className="text-slate-600">Drop-in components for instant integration</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">TypeScript Support</div>
                    <div className="text-slate-600">Fully typed for better developer experience</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Comprehensive Docs</div>
                    <div className="text-slate-600">Detailed guides and API references</div>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-teal-500 text-white hover:opacity-90"
                onClick={() => navigate("/auth")}
              >
                Start building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-white">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-slate-600 ml-4">App.tsx</span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-100">
                  <code>{`import { GlobalPayCheckout } from '@gpc/react';

function App() {
  return (
    <GlobalPayCheckout
      amount={100}
      currency="USD"
      onSuccess={(txHash) => {
        console.log('Payment successful!', txHash);
      }}
    />
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold">Start moving money globally</h3>
          <p className="mt-3 text-slate-600">
            Developer-first SDK, instant settlement, and production-ready compliance. Ship a payments experience in weeks.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              className="px-6 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600"
              onClick={() => navigate("/auth")}
            >
              Create account
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => navigate("/developer")}
            >
              View docs
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-600 to-teal-500" />
              <span className="font-semibold">Global Pay Connect</span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              Blockchain-native settlement for global businesses. Developer-first SDK, instant settlement, and global accounts.
            </p>
          </div>

          <div className="text-sm text-slate-600">
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-slate-800">Payments</a></li>
              <li><a href="#" className="hover:text-slate-800">Payouts</a></li>
              <li><a href="#developers" className="hover:text-slate-800">SDK & Docs</a></li>
            </ul>
          </div>

          <div className="text-sm text-slate-600">
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-slate-800">About</a></li>
              <li><a href="#" className="hover:text-slate-800">Careers</a></li>
              <li><a href="#" className="hover:text-slate-800">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-6 text-sm text-slate-400">
          © <span id="year">{new Date().getFullYear()}</span> Global Pay Connect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

