// Area units
export const AREA_UNITS = [
  { value: "sqft", label: "Square Feet (sq ft)" },
  { value: "sqm", label: "Square Meters (sq m)" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "dimensions", label: "Enter Dimensions (Length × Width)" },
]

// Length units for dimensions
export const LENGTH_UNITS = [
  { value: "ft", label: "Feet (ft)" },
  { value: "m", label: "Meters (m)" },
  { value: "yd", label: "Yards (yd)" },
]

// Currencies
export const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "AED", label: "UAE Dirham (د.إ)" },
]

// Conversion factors to square meters
const AREA_CONVERSION_TO_SQM = {
  sqft: 0.092903,
  sqm: 1,
  acres: 4046.86,
  hectares: 10000,
}

// Conversion factors to meters
const LENGTH_CONVERSION_TO_M = {
  ft: 0.3048,
  m: 1,
  yd: 0.9144,
}

// Calculate area from dimensions
export function calculateAreaFromDimensions(length: number, width: number, unit: string): number {
  // Convert length and width to meters
  const lengthInM = length * (LENGTH_CONVERSION_TO_M[unit as keyof typeof LENGTH_CONVERSION_TO_M] || 1)
  const widthInM = width * (LENGTH_CONVERSION_TO_M[unit as keyof typeof LENGTH_CONVERSION_TO_M] || 1)

  // Return area in square meters
  return lengthInM * widthInM
}

// Convert area between units
export function convertArea(value: number, fromUnit: string, toUnit: string): number {
  // Convert to square meters first
  const valueInSqM = value * (AREA_CONVERSION_TO_SQM[fromUnit as keyof typeof AREA_CONVERSION_TO_SQM] || 1)

  // Then convert from square meters to target unit
  return valueInSqM / (AREA_CONVERSION_TO_SQM[toUnit as keyof typeof AREA_CONVERSION_TO_SQM] || 1)
}

// Format area for display
export function formatArea(value: string | number, unit: string): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  if (isNaN(numValue)) return ""

  const unitObj = AREA_UNITS.find((u) => u.value === unit)
  const unitLabel = unitObj ? unitObj.label.split(" ")[0] : unit

  return `${numValue.toLocaleString()} ${unitLabel}`
}

// Get currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
    CNY: "¥",
    AED: "د.إ",
  }

  return symbols[currencyCode] || currencyCode
}

// Format currency for display
export function formatCurrency(value: string | number, currencyCode: string): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.]/g, "")) : value

  if (isNaN(numValue)) return ""

  const symbol = getCurrencySymbol(currencyCode)

  // Format based on currency
  let formattedValue

  if (currencyCode === "JPY") {
    // No decimal places for Yen
    formattedValue = Math.round(numValue).toLocaleString()
  } else {
    formattedValue = numValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  return `${symbol}${formattedValue}`
}

