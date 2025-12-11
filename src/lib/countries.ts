export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  // North America & Europe
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  
  // Asia Pacific
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  
  // African Countries
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "BW", name: "Botswana", flag: "🇧🇼" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿" },
  { code: "NA", name: "Namibia", flag: "🇳🇦" },
];

// Group countries by region for display
export const countryGroups = [
  {
    label: "Popular",
    countries: countries.filter(c => ["US", "GB", "NG", "KE", "ZA", "GH"].includes(c.code)),
  },
  {
    label: "Africa",
    countries: countries.filter(c => 
      ["NG", "KE", "ZA", "GH", "EG", "RW", "TZ", "UG", "ET", "SN", "CI", "CM", "MA", "TN", "BW", "MU", "ZM", "ZW", "AO", "MZ", "NA"].includes(c.code)
    ),
  },
  {
    label: "Other Regions",
    countries: countries.filter(c => 
      ["US", "GB", "DE", "FR", "SG", "JP", "AE"].includes(c.code)
    ),
  },
];
