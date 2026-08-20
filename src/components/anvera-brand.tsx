import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
};

type MarkProps = {
  className?: string;
  size?: number;
};

export function AnveraLogo({
  className,
  priority = false,
  width = 108,
}: LogoProps) {
  return (
    <Image
      alt="Anvera"
      className={className}
      height={300}
      priority={priority}
      src="/brand/anvera-logo.png"
      style={{
        display: "block",
        height: "auto",
        width,
      }}
      width={900}
    />
  );
}

export function AnveraMark({
  className,
  size = 22,
}: MarkProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={512}
      src="/brand/anvera-mark.png"
      style={{
        display: "block",
        height: size,
        width: size,
      }}
      width={512}
    />
  );
}
