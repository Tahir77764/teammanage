import Image from "next/image";
import Link from "next/link";

const sizes = {
  sm: 32,
  md: 40,
  lg: 64,
};

export default function Logo({
  size = "sm",
  showText = true,
  href = "/",
  className = "",
  textClassName = "text-xl font-bold",
  variant = "default",
  rounded = "lg",
}) {
  const px = sizes[size] || sizes.sm;
  const roundedClass =
    rounded === "full" ? "rounded-full" : rounded === "none" ? "" : "rounded-lg";

  const image = (
    <span
      className={`relative block shrink-0 overflow-hidden ${roundedClass}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/logo.png"
        alt="TeamManage"
        fill
        className="object-cover object-center"
        priority={size === "lg"}
        sizes={`${px}px`}
      />
    </span>
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {image}
      {showText && (
        <span
          className={`${textClassName} ${
            variant === "light" ? "text-white" : "text-gray-900"
          }`}
        >
          TeamManage
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
