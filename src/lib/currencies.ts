// ─────────────────────────────────────────────────────────────
// African Countries & Currencies
// ISO 4217 currency codes with display symbols for all 54
// African Union member states.
// ─────────────────────────────────────────────────────────────

export interface AfricanCurrency {
  country: string;
  countryCode: string;  // ISO 3166-1 alpha-2
  currencyCode: string; // ISO 4217
  currencyName: string;
  symbol: string;
}

export const AFRICAN_CURRENCIES: AfricanCurrency[] = [
  // ── North Africa ──────────────────────────────────────────
  { country: "Algeria",               countryCode: "DZ", currencyCode: "DZD", currencyName: "Algerian Dinar",          symbol: "DA"    },
  { country: "Egypt",                 countryCode: "EG", currencyCode: "EGP", currencyName: "Egyptian Pound",          symbol: "E£"    },
  { country: "Libya",                 countryCode: "LY", currencyCode: "LYD", currencyName: "Libyan Dinar",            symbol: "LD"    },
  { country: "Morocco",               countryCode: "MA", currencyCode: "MAD", currencyName: "Moroccan Dirham",         symbol: "MAD"   },
  { country: "Sudan",                 countryCode: "SD", currencyCode: "SDG", currencyName: "Sudanese Pound",          symbol: "SDG"   },
  { country: "Tunisia",               countryCode: "TN", currencyCode: "TND", currencyName: "Tunisian Dinar",          symbol: "DT"    },

  // ── West Africa ───────────────────────────────────────────
  { country: "Benin",                 countryCode: "BJ", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Burkina Faso",          countryCode: "BF", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Cape Verde",            countryCode: "CV", currencyCode: "CVE", currencyName: "Cape Verdean Escudo",     symbol: "Esc"   },
  { country: "Côte d'Ivoire",         countryCode: "CI", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Gambia",                countryCode: "GM", currencyCode: "GMD", currencyName: "Gambian Dalasi",          symbol: "D"     },
  { country: "Ghana",                 countryCode: "GH", currencyCode: "GHS", currencyName: "Ghanaian Cedi",           symbol: "₵"     },
  { country: "Guinea",                countryCode: "GN", currencyCode: "GNF", currencyName: "Guinean Franc",           symbol: "FG"    },
  { country: "Guinea-Bissau",         countryCode: "GW", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Liberia",               countryCode: "LR", currencyCode: "LRD", currencyName: "Liberian Dollar",         symbol: "L$"    },
  { country: "Mali",                  countryCode: "ML", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Mauritania",            countryCode: "MR", currencyCode: "MRU", currencyName: "Mauritanian Ouguiya",     symbol: "UM"    },
  { country: "Niger",                 countryCode: "NE", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Nigeria",               countryCode: "NG", currencyCode: "NGN", currencyName: "Nigerian Naira",          symbol: "₦"     },
  { country: "Senegal",               countryCode: "SN", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },
  { country: "Sierra Leone",          countryCode: "SL", currencyCode: "SLL", currencyName: "Sierra Leonean Leone",    symbol: "Le"    },
  { country: "Togo",                  countryCode: "TG", currencyCode: "XOF", currencyName: "West African CFA Franc",  symbol: "CFA"   },

  // ── East Africa ───────────────────────────────────────────
  { country: "Burundi",               countryCode: "BI", currencyCode: "BIF", currencyName: "Burundian Franc",         symbol: "Fr"    },
  { country: "Comoros",               countryCode: "KM", currencyCode: "KMF", currencyName: "Comorian Franc",          symbol: "CF"    },
  { country: "Djibouti",              countryCode: "DJ", currencyCode: "DJF", currencyName: "Djiboutian Franc",        symbol: "Fdj"   },
  { country: "Eritrea",               countryCode: "ER", currencyCode: "ERN", currencyName: "Eritrean Nakfa",          symbol: "Nfk"   },
  { country: "Ethiopia",              countryCode: "ET", currencyCode: "ETB", currencyName: "Ethiopian Birr",          symbol: "Br"    },
  { country: "Kenya",                 countryCode: "KE", currencyCode: "KES", currencyName: "Kenyan Shilling",         symbol: "KSh"   },
  { country: "Madagascar",            countryCode: "MG", currencyCode: "MGA", currencyName: "Malagasy Ariary",         symbol: "Ar"    },
  { country: "Mauritius",             countryCode: "MU", currencyCode: "MUR", currencyName: "Mauritian Rupee",         symbol: "₨"     },
  { country: "Rwanda",                countryCode: "RW", currencyCode: "RWF", currencyName: "Rwandan Franc",           symbol: "Fr"    },
  { country: "Seychelles",            countryCode: "SC", currencyCode: "SCR", currencyName: "Seychellois Rupee",       symbol: "₨"     },
  { country: "Somalia",               countryCode: "SO", currencyCode: "SOS", currencyName: "Somali Shilling",         symbol: "Sh"    },
  { country: "South Sudan",           countryCode: "SS", currencyCode: "SSP", currencyName: "South Sudanese Pound",   symbol: "£"     },
  { country: "Tanzania",              countryCode: "TZ", currencyCode: "TZS", currencyName: "Tanzanian Shilling",      symbol: "TSh"   },
  { country: "Uganda",                countryCode: "UG", currencyCode: "UGX", currencyName: "Ugandan Shilling",        symbol: "USh"   },

  // ── Central Africa ────────────────────────────────────────
  { country: "Cameroon",              countryCode: "CM", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "Central African Republic", countryCode: "CF", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "Chad",                  countryCode: "TD", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "Dem. Rep. of Congo",    countryCode: "CD", currencyCode: "CDF", currencyName: "Congolese Franc",         symbol: "FC"    },
  { country: "Equatorial Guinea",     countryCode: "GQ", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "Gabon",                 countryCode: "GA", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "Republic of Congo",     countryCode: "CG", currencyCode: "XAF", currencyName: "Central African CFA Franc", symbol: "FCFA" },
  { country: "São Tomé & Príncipe",   countryCode: "ST", currencyCode: "STN", currencyName: "São Tomé Dobra",          symbol: "Db"    },

  // ── Southern Africa ───────────────────────────────────────
  { country: "Angola",                countryCode: "AO", currencyCode: "AOA", currencyName: "Angolan Kwanza",          symbol: "Kz"    },
  { country: "Botswana",              countryCode: "BW", currencyCode: "BWP", currencyName: "Botswana Pula",           symbol: "P"     },
  { country: "Eswatini",              countryCode: "SZ", currencyCode: "SZL", currencyName: "Swazi Lilangeni",         symbol: "E"     },
  { country: "Lesotho",               countryCode: "LS", currencyCode: "LSL", currencyName: "Lesotho Loti",            symbol: "M"     },
  { country: "Malawi",                countryCode: "MW", currencyCode: "MWK", currencyName: "Malawian Kwacha",         symbol: "MK"    },
  { country: "Mozambique",            countryCode: "MZ", currencyCode: "MZN", currencyName: "Mozambican Metical",      symbol: "MT"    },
  { country: "Namibia",               countryCode: "NA", currencyCode: "NAD", currencyName: "Namibian Dollar",         symbol: "N$"    },
  { country: "South Africa",          countryCode: "ZA", currencyCode: "ZAR", currencyName: "South African Rand",      symbol: "R"     },
  { country: "Zambia",                countryCode: "ZM", currencyCode: "ZMW", currencyName: "Zambian Kwacha",          symbol: "ZK"    },
  { country: "Zimbabwe",              countryCode: "ZW", currencyCode: "ZWG", currencyName: "Zimbabwe Gold",           symbol: "ZiG"   },
];

/** Fast lookup map: currencyCode → symbol */
export const CURRENCY_SYMBOL: Record<string, string> = Object.fromEntries(
  AFRICAN_CURRENCIES.map((c) => [c.currencyCode, c.symbol])
);

/** Fast lookup map: currencyCode → currencyName */
export const CURRENCY_NAME: Record<string, string> = Object.fromEntries(
  AFRICAN_CURRENCIES.map((c) => [c.currencyCode, c.currencyName])
);

/** Returns symbol for a code, falls back to the code itself */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOL[code] ?? code;
}
