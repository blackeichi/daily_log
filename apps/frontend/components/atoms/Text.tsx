export default function Text({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-xs ${className}`}>{children}</div>;
}
