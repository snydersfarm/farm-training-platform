import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-green-100 text-green-800 hover:bg-green-200",
      secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
      destructive: "bg-red-100 text-red-800 hover:bg-red-200",
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className || ""}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge } 