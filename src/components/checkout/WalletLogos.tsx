/**
 * Wallet Logo Components
 * SVG logos for various crypto wallets
 */

interface LogoProps {
  className?: string;
}

export function PhantomLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="24" fill="url(#phantom-gradient)"/>
      <path d="M96.5 42.5C96.5 42.5 95 28 80 28C65 28 58.5 38.5 52 38.5C45.5 38.5 39 28 24 28C9 28 7.5 42.5 7.5 42.5C7.5 42.5 7.5 85 7.5 90C7.5 95 12 100 17.5 100H86.5C92 100 96.5 95 96.5 90C96.5 85 96.5 42.5 96.5 42.5Z" fill="white"/>
      <circle cx="38" cy="58" r="6" fill="#AB9FF2"/>
      <circle cx="66" cy="58" r="6" fill="#AB9FF2"/>
      <defs>
        <linearGradient id="phantom-gradient" x1="0" y1="0" x2="128" y2="128">
          <stop stopColor="#534BB1"/>
          <stop offset="1" stopColor="#551BF9"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MetaMaskLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.4621 3.71289L99.5496 33.8254L92.2871 15.1004L60.4621 3.71289Z" fill="#E17726"/>
      <path d="M60.4621 3.71289L21.9746 33.8254L28.9121 15.1004L60.4621 3.71289Z" fill="#E27625"/>
      <path d="M170.537 3.71289L131.45 33.8254L138.712 15.1004L170.537 3.71289Z" fill="#E27625"/>
      <path d="M170.537 3.71289L209.025 33.8254L202.087 15.1004L170.537 3.71289Z" fill="#E17726"/>
      <path d="M99.5496 33.8254L92.2871 15.1004L60.4621 3.71289L99.5496 33.8254Z" fill="#E27625"/>
      <path d="M131.45 33.8254L138.712 15.1004L170.537 3.71289L131.45 33.8254Z" fill="#E27625"/>
      <path d="M99.5496 33.8254L115.5 94.5004L92.2871 15.1004L99.5496 33.8254Z" fill="#D5BFB2"/>
      <path d="M131.45 33.8254L115.5 94.5004L138.712 15.1004L131.45 33.8254Z" fill="#D5BFB2"/>
      <path d="M115.5 94.5004L99.5496 33.8254L131.45 33.8254L115.5 94.5004Z" fill="#233447"/>
      <path d="M115.5 94.5004L99.5496 33.8254L60.4621 3.71289L115.5 94.5004Z" fill="#CC6228"/>
      <path d="M115.5 94.5004L131.45 33.8254L170.537 3.71289L115.5 94.5004Z" fill="#CC6228"/>
      <path d="M115.5 94.5004L99.5496 150.5L60.4621 3.71289L115.5 94.5004Z" fill="#E27525"/>
      <path d="M115.5 94.5004L131.45 150.5L170.537 3.71289L115.5 94.5004Z" fill="#E27525"/>
      <path d="M115.5 94.5004L99.5496 150.5L131.45 150.5L115.5 94.5004Z" fill="#F5841F"/>
      <path d="M99.5496 150.5L115.5 185.5L131.45 150.5L99.5496 150.5Z" fill="#C0AC9D"/>
    </svg>
  );
}

export function CoinbaseLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="512" fill="#0052FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M512 768C653.856 768 768 653.856 768 512C768 370.144 653.856 256 512 256C370.144 256 256 370.144 256 512C256 653.856 370.144 768 512 768ZM420 420H604V604H420V420Z" fill="white"/>
    </svg>
  );
}

export function SolfareLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="24" fill="url(#solflare-gradient)"/>
      <path d="M32 64L64 32L96 64L64 96L32 64Z" fill="white"/>
      <path d="M64 32L96 64L64 96V32Z" fill="url(#solflare-shine)"/>
      <defs>
        <linearGradient id="solflare-gradient" x1="0" y1="0" x2="128" y2="128">
          <stop stopColor="#FC9965"/>
          <stop offset="1" stopColor="#FD3A84"/>
        </linearGradient>
        <linearGradient id="solflare-shine" x1="64" y1="32" x2="96" y2="96">
          <stop stopColor="white" stopOpacity="0.5"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WalletConnectLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 300 185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M61.439 36.256c48.91-47.888 128.212-47.888 177.123 0l5.886 5.764a6.041 6.041 0 0 1 0 8.67l-20.136 19.716a3.179 3.179 0 0 1-4.428 0l-8.101-7.931c-34.122-33.408-89.444-33.408-123.566 0l-8.675 8.494a3.179 3.179 0 0 1-4.428 0L54.978 51.253a6.041 6.041 0 0 1 0-8.67l6.461-6.327ZM280.206 77.03l17.922 17.547a6.041 6.041 0 0 1 0 8.67l-80.81 79.122c-2.446 2.394-6.41 2.394-8.856 0l-57.354-56.155a1.59 1.59 0 0 0-2.214 0L91.54 182.37c-2.446 2.394-6.411 2.394-8.857 0L1.872 103.247a6.041 6.041 0 0 1 0-8.671l17.922-17.547c2.445-2.394 6.41-2.394 8.856 0l57.355 56.155a1.59 1.59 0 0 0 2.214 0L145.57 77.03c2.446-2.394 6.41-2.395 8.856 0l57.355 56.155a1.59 1.59 0 0 0 2.214 0L271.35 77.03c2.446-2.394 6.41-2.394 8.856 0Z" fill="#3B99FC"/>
    </svg>
  );
}

// Wallet logo mapping
export const WalletLogos = {
  phantom: PhantomLogo,
  metamask: MetaMaskLogo,
  coinbase: CoinbaseLogo,
  solflare: SolfareLogo,
  walletconnect: WalletConnectLogo,
};

