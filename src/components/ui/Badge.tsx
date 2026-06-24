type Props = {
  children: React.ReactNode;
  variant?: "gold" | "navy" | "green" | "red" | "gray" | "yellow";
  className?: string;
};

const variants = {
  gold: "bg-gold-pale text-gold-dark",
  navy: "bg-navy/10 text-navy",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  gray: "bg-gray-100 text-gray-600",
  yellow: "bg-yellow-50 text-yellow-700",
};

export default function Badge({ children, variant = "gray", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
