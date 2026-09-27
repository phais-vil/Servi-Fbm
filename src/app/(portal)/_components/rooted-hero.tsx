"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";

interface RootedHeroProps {
  primaryCtaText?: string;
  primaryCtaHref?: string;
}

export function RootedHero({
  primaryCtaText = "Explore Programs",
  primaryCtaHref = "/programs",
}: RootedHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hoverBranchRef = useRef<HTMLImageElement>(null);
  const baseBranchRef = useRef<HTMLImageElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBehindRef = useRef<HTMLDivElement>(null);
  const baseBranchContainerRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);

  const [isInspecting, setIsInspecting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const hoverImg = hoverBranchRef.current;
    const textTop = textTopRef.current;
    const textBehind = textBehindRef.current;
    const branchContainer = baseBranchContainerRef.current;
    const cursorFollower = cursorFollowerRef.current;

    if (!stage || !hoverImg) return;

    let stageRect = stage.getBoundingClientRect();
    let imgRect = hoverImg.getBoundingClientRect();

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isOver: false,
    };
    let currentRadius = 0;
    let targetRadius = 0;
    let maxRadius = 110;
    let time = 0;
    let animationFrameId: number;

    function updateDimensions() {
      if (stage) stageRect = stage.getBoundingClientRect();
      if (hoverImg) {
        imgRect = hoverImg.getBoundingClientRect();
        maxRadius = Math.min(imgRect.width, imgRect.height) * 0.22;
      }
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    const onMouseMoveStage = (e: MouseEvent) => {
      updateDimensions();
      mouse.targetX = e.clientX - imgRect.left;
      mouse.targetY = e.clientY - imgRect.top;
      mouse.isOver = true;
      targetRadius = maxRadius;
    };

    const onMouseEnterStage = () => {
      mouse.isOver = true;
      targetRadius = maxRadius;
      setIsHovered(true);
    };

    const onMouseLeaveStage = () => {
      mouse.isOver = false;
      targetRadius = 0;
      setIsHovered(false);

      const baseScale = window.innerWidth < 640 ? "scale(1.08)" : "scale(1.22)";
      if (textTop) {
        textTop.style.transform = "translate3d(0,0,0) rotateX(0) rotateY(0)";
      }
      if (branchContainer) {
        branchContainer.style.transform = `${baseScale} translate3d(0,0,0) rotateX(0) rotateY(0)`;
      }
      if (textBehind) {
        textBehind.style.transform = "translate3d(0,0,0) rotateX(0) rotateY(0)";
      }
    };

    const onGlobalMouseMove = (e: MouseEvent) => {
      if (cursorFollower && mouse.isOver) {
        cursorFollower.style.opacity = "1";
        cursorFollower.style.transform = `translate3d(${e.clientX - 24}px, ${e.clientY - 24}px, 0)`;
      } else if (cursorFollower) {
        cursorFollower.style.opacity = "0";
      }

      // 3D Parallax Tilt Effect
      if (mouse.isOver && stage) {
        const centerX = stageRect.left + stageRect.width / 2;
        const centerY = stageRect.top + stageRect.height / 2;
        const normX = (e.clientX - centerX) / (stageRect.width / 2);
        const normY = (e.clientY - centerY) / (stageRect.height / 2);

        const baseScale = window.innerWidth < 640 ? "scale(1.08)" : "scale(1.22)";

        if (textTop) {
          textTop.style.transform = `translate3d(${normX * 18}px, ${normY * 14}px, 25px) rotateY(${normX * 4}deg) rotateX(${-normY * 4}deg)`;
        }
        if (branchContainer) {
          branchContainer.style.transform = `${baseScale} translate3d(${normX * 8}px, ${normY * 6}px, 15px) rotateY(${normX * 2}deg) rotateX(${-normY * 2}deg)`;
        }
        if (textBehind) {
          textBehind.style.transform = `translate3d(${-normX * 12}px, ${-normY * 8}px, -10px) rotateY(${-normX * 3}deg) rotateX(${normY * 3}deg)`;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateDimensions();
        mouse.targetX = touch.clientX - imgRect.left;
        mouse.targetY = touch.clientY - imgRect.top;
        mouse.isOver = true;
        targetRadius = maxRadius * 1.3;
      }
    };

    const onTouchEnd = () => {
      mouse.isOver = false;
      targetRadius = 0;
    };

    stage.addEventListener("mousemove", onMouseMoveStage);
    stage.addEventListener("mouseenter", onMouseEnterStage);
    stage.addEventListener("mouseleave", onMouseLeaveStage);
    window.addEventListener("mousemove", onGlobalMouseMove);
    stage.addEventListener("touchmove", onTouchMove, { passive: true });
    stage.addEventListener("touchend", onTouchEnd);

    // High-Performance GPU Liquid Mask Animation Loop
    function animateLiquidReveal() {
      time += 0.04;

      mouse.x += (mouse.targetX - mouse.x) * 0.16;
      mouse.y += (mouse.targetY - mouse.y) * 0.16;
      currentRadius += (targetRadius - currentRadius) * 0.12;

      if (currentRadius > 0.5 && hoverImg) {
        const d1X = mouse.x + Math.sin(time * 2.5) * (currentRadius * 0.35);
        const d1Y = mouse.y + Math.cos(time * 2.5) * (currentRadius * 0.35);
        const d2X = mouse.x - Math.cos(time * 2.0) * (currentRadius * 0.45);
        const d2Y = mouse.y + Math.sin(time * 2.0) * (currentRadius * 0.45);
        const d3X = mouse.x + Math.cos(time * 3.1) * (currentRadius * 0.3);
        const d3Y = mouse.y - Math.sin(time * 3.1) * (currentRadius * 0.3);

        const rMain = currentRadius;
        const rSub1 = currentRadius * 0.65;
        const rSub2 = currentRadius * 0.55;
        const rSub3 = currentRadius * 0.5;

        const maskValue = `
          radial-gradient(circle ${rMain}px at ${mouse.x.toFixed(1)}px ${mouse.y.toFixed(1)}px, #000 0%, #000 70%, rgba(0,0,0,0.85) 85%, transparent 100%),
          radial-gradient(circle ${rSub1}px at ${d1X.toFixed(1)}px ${d1Y.toFixed(1)}px, #000 0%, #000 65%, transparent 100%),
          radial-gradient(circle ${rSub2}px at ${d2X.toFixed(1)}px ${d2Y.toFixed(1)}px, #000 0%, #000 65%, transparent 100%),
          radial-gradient(circle ${rSub3}px at ${d3X.toFixed(1)}px ${d3Y.toFixed(1)}px, #000 0%, #000 65%, transparent 100%)
        `;

        hoverImg.style.maskImage = maskValue;
        hoverImg.style.webkitMaskImage = maskValue;
        hoverImg.style.opacity = "1";
      } else if (hoverImg) {
        hoverImg.style.opacity = "0";
      }

      animationFrameId = requestAnimationFrame(animateLiquidReveal);
    }

    animationFrameId = requestAnimationFrame(animateLiquidReveal);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
      window.removeEventListener("mousemove", onGlobalMouseMove);
      stage.removeEventListener("mousemove", onMouseMoveStage);
      stage.removeEventListener("mouseenter", onMouseEnterStage);
      stage.removeEventListener("mouseleave", onMouseLeaveStage);
      stage.removeEventListener("touchmove", onTouchMove);
      stage.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section className="relative w-full rounded-3xl bg-white text-slate-900 border border-slate-200/80 shadow-xs overflow-hidden select-none mb-12">
      {/* SVG Filters for Organic Liquid Wobble */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-wobble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves={2} result="noise">
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.02 0.04;0.04 0.02;0.02 0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={18} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Interactive Liquid Cursor Follower */}
      <div
        ref={cursorFollowerRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full border-2 border-slate-400/40 pointer-events-none z-50 transition-opacity duration-150 ease-out opacity-0 md:flex hidden items-center justify-center bg-slate-900/5 backdrop-blur-[2px]"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 animate-ping" />
      </div>

      {/* Top Tagline Bar */}
      <div className="relative z-40 w-full px-6 sm:px-10 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider font-[family-name:var(--font-space)] uppercase bg-slate-100 text-slate-700 border border-slate-200/80">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Biophilic Growth • Next-Gen Faculty</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-[family-name:var(--font-space)] text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          <span>R O O T E D</span>
        </div>
      </div>

      {/* STAGE CONTAINER */}
      <div
        ref={stageRef}
        className={`relative w-full h-[480px] sm:h-[560px] md:h-[640px] lg:h-[700px] flex flex-col items-center justify-center bg-white overflow-visible cursor-none ${
          isInspecting ? "inspect-layers" : ""
        }`}
      >
        {/* Left Vertical Tagline Accent */}
        <div className="hidden lg:flex flex-col absolute left-8 xl:left-12 top-1/2 -translate-y-1/2 z-40 text-[11px] font-[family-name:var(--font-space)] font-semibold tracking-[0.25em] text-slate-400 uppercase leading-relaxed border-l-2 border-slate-300 pl-4 py-1">
          <span>STRONGER</span>
          <span>ROOTS,</span>
          <span>BRIGHTER</span>
          <span>TOMORROW.</span>
        </div>

        {/* LINE 1: FRONT/TOP HEADLINE "STAY" (z-index: 40) */}
        <div
          ref={textTopRef}
          className={`absolute top-[14%] sm:top-[12%] md:top-[10%] z-40 pointer-events-none transition-transform duration-300 ease-out ${
            isInspecting ? "!translate-y-[45px] !scale-105 outline-2 outline-dashed outline-emerald-500 rounded-lg p-2" : ""
          }`}
        >
          <h1
            className="font-[family-name:var(--font-syne)] font-black text-[22vw] sm:text-[20vw] md:text-[17vw] lg:text-[200px] leading-none tracking-[0.02em] uppercase text-slate-900 text-center select-none"
            style={{
              filter: isHovered
                ? "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.18))"
                : "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.12))",
            }}
          >
            STAY
          </h1>
        </div>

        {/* SHARED MASTER BRANCH CONTAINER */}
        <div
          ref={baseBranchContainerRef}
          className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-transform duration-300 ease-out overflow-visible ${
            isInspecting ? "outline-2 outline-dashed outline-amber-500 rounded-lg" : ""
          }`}
          style={{
            transform: "scale(1.22)",
            transformOrigin: "center center",
          }}
        >
          {/* Base Dry Wood Branch Image */}
          <img
            ref={baseBranchRef}
            src="/images/rooted/branch-img.png"
            alt="Organic Wood Branch Base"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
            style={{
              filter: "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.12))",
            }}
          />

          {/* Green Blooming Branch Image (STRICTLY ON TOP OF BASE BRANCH) */}
          <img
            ref={hoverBranchRef}
            src="/images/rooted/branch-img-hover.png"
            alt="Blooming Branch Lush Green"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-30 opacity-0 transition-opacity duration-200"
            style={{
              filter: "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.12))",
            }}
          />
        </div>

        {/* LINE 2: BEHIND BRANCH HEADLINE "WILD" (z-index: 10) */}
        <div
          ref={textBehindRef}
          className={`absolute bottom-[22%] sm:bottom-[20%] md:bottom-[18%] z-10 pointer-events-none transition-transform duration-300 ease-out ${
            isInspecting ? "!-translate-y-[45px] !scale-95 outline-2 outline-dashed outline-blue-500 rounded-lg p-2" : ""
          }`}
        >
          <h2
            className={`font-[family-name:var(--font-syne)] font-black text-[22vw] sm:text-[20vw] md:text-[17vw] lg:text-[200px] leading-none tracking-[0.02em] uppercase select-none transition-colors duration-400 ${
              isHovered ? "text-slate-400" : "text-slate-300"
            }`}
          >
            WILD
          </h2>
        </div>
      </div>

      {/* HERO SUB-CONTENT & CTA BUTTONS */}
      <div className="relative z-40 max-w-2xl mx-auto text-center flex flex-col items-center gap-4 pb-8 px-4">
        {/* Subtitle Lines */}
        <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-space)] tracking-[0.22em] text-slate-700 uppercase">
          <p className="text-xs sm:text-sm font-bold text-slate-900">
            BOLDER IDEAS &nbsp;&bull;&nbsp; DEEPER IMPACT
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-[0.25em]">
            CREATE &nbsp;&bull;&nbsp; BUILD &nbsp;&bull;&nbsp; MAKE IT LAST
          </p>
        </div>

        {/* CTA Actions */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            href={primaryCtaHref}
            className="px-8 py-3.5 rounded-full border border-slate-900 bg-white hover:bg-slate-900 text-slate-900 hover:text-white font-[family-name:var(--font-space)] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-3 group"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={() => setIsInspecting((prev) => !prev)}
            className={`px-4 py-3 rounded-full border transition-all text-xs font-[family-name:var(--font-space)] flex items-center gap-1.5 ${
              isInspecting
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900 bg-white"
            }`}
            title="Inspect 3D Layers"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isInspecting ? "3D Layers: Active" : "Inspect 3D"}
            </span>
          </button>
        </div>

        {/* Hint Status */}
        <p className="text-[11px] font-[family-name:var(--font-space)] text-slate-400 uppercase tracking-wider flex items-center gap-2 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hover branch to reveal green foliage &bull; 3D Parallax Active</span>
        </p>
      </div>
    </section>
  );
}
