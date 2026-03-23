import Image from "next/image";
import Link from "next/link";

export const HeaderLogo = ({ to }: { to: string }) => {
  return (
    <Link href={to} className="inline-block">
      <Image
        src="/Logo.svg"
        alt="Dlog logo"
        width={120}
        height={40}
        priority
        className="w-16 sm:w-28 h-auto"
      />
    </Link>
  );
};
