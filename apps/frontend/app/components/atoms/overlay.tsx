export default function Overlay({
  onClick,
  isOpen = true,
  children,
  style = {},
  zIndex,
}: {
  onClick: () => void;
  isOpen?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  zIndex?: number;
}) {
  return (
    <div
      className={`fixed w-screen h-screen left-0 top-0 justify-center bg-[rgba(0,0,0,0.4)] items-center ${
        isOpen ? "flex" : "hidden"
      }`}
      style={{ zIndex: zIndex || 50 }}
      onMouseDown={onClick}
    >
      <div
        className="p-1 bg-stone-100 rounded-md shadow-lg shadow-stone-600 max-h-[95vh] overflow-y-auto"
        style={style}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
