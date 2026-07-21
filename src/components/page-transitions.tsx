import React, { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PageTransition({ children, className = "", delay = 0 }: PageTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export function Stagger({ children, className = "", staggerMs = 60 }: StaggerProps) {
  const items = React.Children.toArray(children);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className="transition-all duration-400 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${i * staggerMs}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function GlowCard({ children, className = "", color = "primary" }: GlowCardProps) {
  const [hover, setHover] = useState(false);
  const colorMap: Record<string, string> = {
    primary: "rgba(139, 92, 246, 0.12)",
    blue: "rgba(59, 130, 246, 0.12)",
    green: "rgba(34, 197, 94, 0.12)",
    red: "rgba(239, 68, 68, 0.12)",
    yellow: "rgba(234, 179, 8, 0.12)",
  };

  return (
    <div
      className={`relative transition-all duration-300 ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        boxShadow: hover ? `0 0 30px ${colorMap[color] || colorMap.primary}, 0 4px 20px rgba(0,0,0,0.3)` : "0 4px 15px rgba(0,0,0,0.2)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {children}
    </div>
  );
}
