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

export function AqenaLogo({
  className,
  priority = false,
  width = 108,
}: LogoProps) {
  const markSize = Math.max(
    28,
    Math.round(width * 0.3),
  );

  const wordSize = Math.max(
    15,
    Math.round(width * 0.15),
  );

  return (
    <span
      aria-label="AQENA"
      className={className}
      style={{
        alignItems: "center",
        display: "inline-flex",
        gap: Math.max(
          7,
          Math.round(width * 0.07),
        ),
        lineHeight: 1,
        width,
      }}
    >
      <Image
        alt=""
        aria-hidden="true"
        height={512}
        priority={priority}
        src="/brand/aqena-mark.png"
        style={{
          display: "block",
          flex: "0 0 auto",
          height: markSize,
          width: markSize,
        }}
        width={512}
      />

      <span
        aria-hidden="true"
        style={{
          color: "currentColor",
          display: "block",
          fontFamily: "inherit",
          fontSize: wordSize,
          fontWeight: 720,
          letterSpacing: "0.115em",
          marginRight: "-0.115em",
          whiteSpace: "nowrap",
        }}
      >
        AQENA
      </span>
    </span>
  );
}

export function AqenaMark({
  className,
  size = 22,
}: MarkProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={512}
      src="/brand/aqena-mark.png"
      style={{
        display: "block",
        height: size,
        width: size,
      }}
      width={512}
    />
  );
}
