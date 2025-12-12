# Logo Visual Guide

Visual reference for all logos used in the Klyr Checkout Widget.

## 🪙 Token Logos

### USDC (USD Coin)
- **File**: `/public/usd-coin-usdc-logo.svg`
- **Colors**: Blue circle with white "USDC"
- **Usage**: Stablecoin payments
- **Display**: Token badge in payment options

### USDT (Tether)
- **File**: `/public/tether-usdt-logo.svg`
- **Colors**: Green circle with white "₮"
- **Usage**: Stablecoin payments
- **Display**: Token badge in payment options

---

## 🌐 Network Logos

### Solana
- **File**: `/public/solana-sol-logo.svg`
- **Colors**: Purple/blue gradient
- **Symbol**: Stylized "S" or Solana icon
- **Usage**: Solana network indicator
- **Display**: Background in payment options

### Base
- **File**: `/public/base.png`
- **Colors**: Blue circle
- **Symbol**: Base logo
- **Usage**: Base network indicator
- **Display**: Background in payment options

---

## 👛 Wallet Logos

### Phantom
- **Component**: `PhantomLogo`
- **Colors**: Purple gradient (#534BB1 to #551BF9)
- **Symbol**: Ghost icon
- **Usage**: Solana wallet connection
- **Display**: Wallet selection screen

### MetaMask
- **Component**: `MetaMaskLogo`
- **Colors**: Orange/brown fox
- **Symbol**: Fox head
- **Usage**: EVM wallet connection
- **Display**: Wallet selection screen

### Coinbase Wallet
- **Component**: `CoinbaseLogo`
- **Colors**: Blue (#0052FF)
- **Symbol**: Coinbase "C" in square
- **Usage**: EVM wallet connection
- **Display**: Wallet selection screen

---

## 📐 Logo Sizes

### Small (Badge)
- **Size**: 24px × 24px (w-6 h-6)
- **Usage**: Token badges on stacked logos
- **Border**: 2px white border
- **Shadow**: shadow-md

### Medium (Standard)
- **Size**: 48px × 48px (w-12 h-12)
- **Usage**: Main logos in lists
- **Padding**: p-1.5 or p-2
- **Shadow**: shadow-sm

### Large (Success)
- **Size**: 80px × 80px (w-20 h-20)
- **Usage**: Success screen
- **Badge**: 40px × 40px (w-10 h-10)
- **Shadow**: shadow-lg

---

## 🎨 Logo Combinations

### Payment Method Display

```
┌──────────────────────────────────┐
│                                  │
│    ┌─────────┐                   │
│    │ Solana  │ [USDC]            │
│    │  Logo   │                   │
│    └─────────┘                   │
│                                  │
│    USDC                          │
│    Solana Network    [Popular]   │
│                                  │
└──────────────────────────────────┘
```

**Components**:
- Large Solana logo (background)
- Small USDC logo (bottom-right badge)
- Text labels
- Popular badge

---

### Wallet Selection

```
┌──────────────────────────────────┐
│                                  │
│    ┌─────────┐                   │
│    │ Phantom │                   │
│    │  Logo   │  Phantom          │
│    └─────────┘  ● Detected       │
│                        Connect → │
│                                  │
└──────────────────────────────────┘
```

**Components**:
- Wallet logo (Phantom/MetaMask/Coinbase)
- Wallet name
- Status indicator (green dot)
- Connect button

---

### Success Receipt

```
        ┌─────────────┐
        │             │
        │      ✓      │ [USDC]
        │             │
        └─────────────┘
        
    Payment Successful!
```

**Components**:
- Large success checkmark
- Small token logo badge
- Success message

---

## 🌓 Dark Mode Support

All logos adapt to dark mode:

### Light Mode
- **Background**: White
- **Border**: Light gray (slate-200)
- **Shadow**: Subtle

### Dark Mode
- **Background**: Dark slate (slate-800)
- **Border**: Dark gray (slate-700)
- **Shadow**: Darker

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Logos maintain size
- Stacked layout for text
- Touch-friendly spacing

### Tablet (640px - 1024px)
- Standard logo sizes
- Horizontal layout
- Comfortable spacing

### Desktop (> 1024px)
- Standard logo sizes
- Horizontal layout
- Generous spacing

---

## ♿ Accessibility

### Alt Text
- Token logos: "USDC", "USDT"
- Network logos: "Solana", "Base"
- Wallet logos: "Phantom", "MetaMask", "Coinbase Wallet"

### Contrast
- All logos meet WCAG AA standards
- Visible in both light and dark modes
- Clear against backgrounds

---

## 🎯 Logo States

### Default
- Full color
- Normal opacity
- Standard shadow

### Hover
- Slight scale (1.02)
- Enhanced shadow
- Border color change

### Active/Selected
- Blue border
- Blue background tint
- Enhanced visibility

### Disabled
- 50% opacity
- Grayscale filter
- No hover effects

---

## 📦 File Organization

```
public/
├── usd-coin-usdc-logo.svg    # USDC token
├── tether-usdt-logo.svg      # USDT token
├── solana-sol-logo.svg       # Solana network
└── base.png                  # Base network

src/components/checkout/
└── WalletLogos.tsx           # Wallet SVG components
    ├── PhantomLogo
    ├── MetaMaskLogo
    ├── CoinbaseLogo
    ├── SolfareLogo
    └── WalletConnectLogo
```

---

## 🔄 Adding New Logos

### For Tokens
1. Add SVG to `/public/`
2. Update `getTokenLogo()` function
3. Add to payment options

### For Networks
1. Add SVG/PNG to `/public/`
2. Update `getNetworkLogo()` function
3. Add to chain options

### For Wallets
1. Create SVG component in `WalletLogos.tsx`
2. Export from component
3. Add to wallet options

---

## ✨ Best Practices

1. **Use SVG when possible** - Better scaling
2. **Optimize file sizes** - Faster loading
3. **Provide fallbacks** - Unknown tokens/networks
4. **Test in dark mode** - Ensure visibility
5. **Add alt text** - Accessibility
6. **Maintain aspect ratio** - No distortion
7. **Use consistent sizing** - Visual harmony

---

**All logos are professionally integrated and enhance the user experience!** 🎨

