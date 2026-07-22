import React, { useEffect, useRef, useState } from "react";

export function PageTransition({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay || 50);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

export function Stagger({ children, className = "", staggerMs = 80 }: { children: React.ReactNode; className?: string; staggerMs?: number }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <StaggerItem key={i} delay={i * staggerMs}>
          {child}
        </StaggerItem>
      ))}
    </div>
  );
}

function StaggerItem({ children, delay }: { children: React.ReactNode; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay + 50);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {children}
    </div>
  );
}

export function GlowCard({ children, color = "magenta", className = "" }: { children: React.ReactNode; color?: "magenta" | "cyan" | "violet" | "amber" | "red"; className?: string }) {
  return (
    <div className={`card-hover ${className}`}>
      {children}
    </div>
  );
}

export function FloatingOrb({ color, size, top, left, delay = 0 }: { color: string; size: number; top: string; left: string; delay?: number }) {
  return (
    <div
      className="pointer-events-none absolute rounded-full blur-[80px] animate-float-slow"
      style={{ width: size, height: size, top, left, background: color, animationDelay: `${delay}s` }}
    />
  );
}

export function AnimatedCounter({ value, className = "" }: { value: number | string; className?: string }) {
  return (
    <span
      key={String(value)}
      className={className}
      style={{ animation: "countUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {value}
    </span>
  );
}

export function ProgressRing({ value, max, size = 80, strokeWidth = 6, color = "#FF006E" }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${color}40)`,
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </svg>
  );
}
