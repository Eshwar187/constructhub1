import { Building2 } from "lucide-react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  const textClasses = {
    default: "bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent",
    white: "text-white",
  }

  const iconClasses = {
    default: "text-amber-500",
    white: "text-white",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Building2 className={`${sizeClasses[size]} ${iconClasses[variant]}`} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
      </div>
      <span
        className={`font-bold ${size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-3xl"} ${textClasses[variant]}`}
      >
        ConstructHub
      </span>
    </div>
  )
}

