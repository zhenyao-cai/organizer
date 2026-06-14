import Link from "next/link";
import { AppImage } from "./AppImage";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  href?: string;
}

const sizeMap = {
  sm: { img: "h-8 w-8", text: "text-lg" },
  md: { img: "h-10 w-10", text: "text-2xl" },
  lg: { img: "h-14 w-14", text: "text-3xl" },
};

export function AppLogo({
  size = "md",
  showName = true,
  href = "/",
}: AppLogoProps) {
  const s = sizeMap[size];

  const content = (
    <>
      <AppImage
        src="/logo.png"
        alt="Yaorganize"
        width={56}
        height={56}
        className={`${s.img} shrink-0 rounded-xl object-contain`}
      />
      {showName && (
        <span className={`${s.text} font-extrabold text-ink tracking-tight`}>
          Yaorganize
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-2.5">
        {content}
      </Link>
    );
  }

  return <div className="inline-flex items-center gap-2.5">{content}</div>;
}
