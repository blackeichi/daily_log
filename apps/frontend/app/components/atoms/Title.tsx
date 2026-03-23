export default function Title({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`font-bold text-xl ${className}`}>{children}</div>;
}
