import { memo, useEffect, useId, useState } from "react";
import { MENU_LIST, ROUTE } from "@/constants/routes";
import Link from "next/link";
import { CiMenuKebab } from "react-icons/ci";
import { HeaderLogo } from "../atoms/headerLogo";

const MenuList = () => {
  const [hasScroll, setHasScroll] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      setHasScroll(currentScrollTop >= 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header
      className={`w-full fixed top-0 left-0 h-24 flex justify-center bg-stone-100/30 backdrop-blur-md select-none z-40 ${
        hasScroll ? "shadow-md" : ""
      }`}
    >
      <div className="w-full h-full flex justify-between items-center max-w-5xl px-2">
        <div className="cursor-pointer">
          <HeaderLogo to={ROUTE.HOME} />
        </div>
        <nav
          className="relative"
          aria-label="주 메뉴"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setOpenMenu(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpenMenu(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setOpenMenu(!openMenu)}
            className="p-1 hover:bg-stone-200 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
            aria-label={openMenu ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={openMenu}
            aria-controls={menuId}
          >
            <CiMenuKebab
              aria-hidden="true"
              className={`text-2xl sm:text-4xl ${openMenu ? "" : "rotate-90"} transition-transform duration-300`}
            />
          </button>
          <div
            id={menuId}
            className={`absolute top-8 p-2 sm:top-10 w-20 sm:w-32 right-0 min-w-max bg-white rounded-md overflow-hidden shadow-md shadow-stone-500 transition-all duration-300 origin-top-right ${openMenu ? "opacity-100 scale-100" : "opacity-0 scale-60 pointer-events-none"}`}
            hidden={!openMenu}
          >
            {MENU_LIST.map((menu) => (
              <Link
                key={menu.id}
                href={menu.href}
                className="block px-6 pl-2 py-2 sm:py-4 text-xs sm:text-sm text-stone-800 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
                onClick={() => setOpenMenu(false)}
                prefetch={false}
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default memo(MenuList);
