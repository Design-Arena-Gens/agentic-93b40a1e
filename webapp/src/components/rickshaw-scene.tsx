"use client";

import { useEffect, useRef } from "react";

type FogLayer = {
  offset: number;
  speed: number;
  y: number;
  opacity: number;
  height: number;
};

type SkylineBlock = {
  x: number;
  width: number;
  height: number;
  color: string;
};

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export default function RickshawScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
      context.scale(dpr, dpr);
    };

    resize();

    const fogLayers: FogLayer[] = Array.from({ length: 5 }, (_, index) => ({
      offset: Math.random() * CANVAS_WIDTH,
      speed: 18 + index * 9,
      y: CANVAS_HEIGHT * 0.25 + index * 38,
      opacity: 0.12 + index * 0.05,
      height: 90 + index * 25,
    }));

    const skyline: SkylineBlock[] = Array.from({ length: 9 }, (_, index) => {
      const widthMultiplier = 0.08 + Math.random() * 0.08;
      return {
        x:
          index * (CANVAS_WIDTH / 8) +
          Math.random() * (CANVAS_WIDTH / 20) -
          CANVAS_WIDTH * 0.05,
        width: CANVAS_WIDTH * widthMultiplier,
        height:
          CANVAS_HEIGHT * (0.22 + Math.random() * 0.18) +
          (index % 2 === 0 ? 18 : -6),
        color: `rgba(22, 41, 53, ${0.28 + index * 0.04})`,
      };
    });

    let animationFrameId = 0;
    let lastTimestamp = performance.now();
    let foregroundScroll = 0;

    const drawBackground = () => {
      const gradient = context.createLinearGradient(
        0,
        0,
        0,
        CANVAS_HEIGHT
      );
      gradient.addColorStop(0, "#1c2d3f");
      gradient.addColorStop(0.5, "#243c4b");
      gradient.addColorStop(1, "#4d524b");
      context.fillStyle = gradient;
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const sunGradient = context.createRadialGradient(
        CANVAS_WIDTH * 0.75,
        CANVAS_HEIGHT * 0.2,
        10,
        CANVAS_WIDTH * 0.75,
        CANVAS_HEIGHT * 0.2,
        220
      );
      sunGradient.addColorStop(0, "rgba(255, 202, 128, 0.38)");
      sunGradient.addColorStop(1, "rgba(255, 202, 128, 0)");
      context.fillStyle = sunGradient;
      context.beginPath();
      context.arc(
        CANVAS_WIDTH * 0.75,
        CANVAS_HEIGHT * 0.2,
        220,
        0,
        Math.PI * 2
      );
      context.fill();
    };

    const drawSkyline = () => {
      skyline.forEach((block) => {
        context.fillStyle = block.color;
        context.fillRect(
          block.x,
          CANVAS_HEIGHT * 0.35 - block.height,
          block.width,
          block.height
        );
      });

      context.fillStyle = "rgba(30, 49, 58, 0.4)";
      context.fillRect(
        -CANVAS_WIDTH * 0.1,
        CANVAS_HEIGHT * 0.5,
        CANVAS_WIDTH * 1.2,
        CANVAS_HEIGHT * 0.3
      );
    };

    const drawRoad = (time: number) => {
      const roadTop = CANVAS_HEIGHT * 0.55;
      const roadGradient = context.createLinearGradient(
        0,
        roadTop,
        0,
        CANVAS_HEIGHT
      );
      roadGradient.addColorStop(0, "#2b2f33");
      roadGradient.addColorStop(1, "#1a1c1f");
      context.fillStyle = roadGradient;
      context.fillRect(0, roadTop, CANVAS_WIDTH, CANVAS_HEIGHT - roadTop);

      context.strokeStyle = "rgba(255, 225, 180, 0.45)";
      context.lineWidth = 2;
      context.setLineDash([16, 26]);
      context.lineDashOffset = (time / 18) % 42;
      context.beginPath();
      context.moveTo(CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.62);
      context.lineTo(CANVAS_WIDTH * 0.9, CANVAS_HEIGHT * 0.68);
      context.stroke();

      context.strokeStyle = "rgba(255, 255, 255, 0.12)";
      context.lineWidth = 3;
      context.setLineDash([]);
      context.beginPath();
      context.moveTo(0, CANVAS_HEIGHT * 0.55);
      context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT * 0.65);
      context.stroke();
    };

    const drawRickshaw = (time: number) => {
      const baseX = CANVAS_WIDTH * 0.42;
      const baseY = CANVAS_HEIGHT * 0.62;
      const bounce = Math.sin(time / 320) * 4;
      const drift = Math.sin(time / 1500) * 8;
      const x = baseX + drift;
      const y = baseY + bounce;

      context.save();

      // Wheels
      const wheelOffsets = [-120, 120];
      wheelOffsets.forEach((offset, index) => {
        const wheelX = x + offset;
        const wheelY = y + 48;
        const rotation = ((time / 260) * (index === 0 ? 1.1 : 1.25)) % 360;

        context.beginPath();
        context.fillStyle = "#1a1a1a";
        context.arc(wheelX, wheelY, 46, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = "#d5d4ce";
        context.lineWidth = 4;
        context.beginPath();
        context.arc(wheelX, wheelY, 32, 0, Math.PI * 2);
        context.stroke();

        context.save();
        context.translate(wheelX, wheelY);
        context.rotate((rotation * Math.PI) / 180);
        context.strokeStyle = "rgba(210, 210, 210, 0.7)";
        context.lineWidth = 3;
        for (let spoke = 0; spoke < 6; spoke += 1) {
          const angle = (spoke * Math.PI) / 3;
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(Math.cos(angle) * 32, Math.sin(angle) * 32);
          context.stroke();
        }
        context.restore();
      });

      // Chassis
      context.fillStyle = "#2e5a4f";
      context.strokeStyle = "#21433a";
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(x - 120, y + 18);
      context.quadraticCurveTo(x - 40, y - 10, x + 110, y - 4);
      context.lineTo(x + 110, y + 20);
      context.lineTo(x - 110, y + 32);
      context.closePath();
      context.fill();
      context.stroke();

      // Seat and canopy
      context.fillStyle = "#3d766a";
      context.beginPath();
      context.moveTo(x - 78, y - 82);
      context.quadraticCurveTo(x, y - 148, x + 92, y - 100);
      context.lineTo(x + 70, y - 28);
      context.lineTo(x - 60, y - 40);
      context.closePath();
      context.fill();

      const canopyGradient = context.createLinearGradient(
        x - 90,
        y - 150,
        x + 90,
        y - 20
      );
      canopyGradient.addColorStop(0, "#1b3b56");
      canopyGradient.addColorStop(0.5, "#284c6c");
      canopyGradient.addColorStop(1, "#1b3248");
      context.fillStyle = canopyGradient;
      context.beginPath();
      context.moveTo(x - 90, y - 76);
      context.quadraticCurveTo(x, y - 170, x + 98, y - 82);
      context.quadraticCurveTo(x + 70, y - 40, x - 50, y - 42);
      context.closePath();
      context.fill();

      // Headlights glow
      const headlightGradient = context.createRadialGradient(
        x + 132,
        y + 12,
        6,
        x + 132,
        y + 12,
        48
      );
      headlightGradient.addColorStop(0, "rgba(255, 235, 180, 0.65)");
      headlightGradient.addColorStop(1, "rgba(255, 235, 180, 0)");
      context.fillStyle = headlightGradient;
      context.beginPath();
      context.arc(x + 132, y + 12, 48, 0, Math.PI * 2);
      context.fill();

      // Driver
      const driverX = x - 16;
      const driverY = y - 20;

      // Lungi
      const lungiGradient = context.createLinearGradient(
        driverX - 20,
        driverY + 58,
        driverX + 24,
        driverY + 6
      );
      lungiGradient.addColorStop(0, "#24495b");
      lungiGradient.addColorStop(1, "#3a6c80");
      context.fillStyle = lungiGradient;
      context.beginPath();
      context.moveTo(driverX - 18, driverY + 12);
      context.quadraticCurveTo(
        driverX + Math.sin(time / 380) * 10,
        driverY + 72,
        driverX + 26,
        driverY + 68
      );
      context.lineTo(driverX + 8, driverY + 12);
      context.closePath();
      context.fill();

      // Jacket
      context.fillStyle = "#5f5e6d";
      context.beginPath();
      context.moveTo(driverX - 10, driverY - 22);
      context.quadraticCurveTo(driverX + 6, driverY + 12, driverX + 2, driverY + 48);
      context.lineTo(driverX - 22, driverY + 32);
      context.quadraticCurveTo(driverX - 28, driverY, driverX - 18, driverY - 30);
      context.closePath();
      context.fill();

      // Face and head
      context.fillStyle = "#c49262";
      context.beginPath();
      context.arc(driverX + 4, driverY - 28, 14, 0, Math.PI * 2);
      context.fill();

      // Hair/beard
      context.fillStyle = "#2d241c";
      context.beginPath();
      context.arc(driverX + 2, driverY - 32, 14, Math.PI * 0.2, Math.PI * 0.8);
      context.lineTo(driverX + 8, driverY - 14);
      context.quadraticCurveTo(driverX - 6, driverY - 10, driverX - 2, driverY - 34);
      context.closePath();
      context.fill();

      // Arms and handle
      const handleY = y - 12;
      context.strokeStyle = "#3b3f45";
      context.lineWidth = 9;
      context.beginPath();
      context.moveTo(x - 24, handleY);
      context.lineTo(x + 90, handleY + 12);
      context.stroke();

      context.strokeStyle = "#cfa87a";
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(driverX - 8, driverY + 8);
      context.quadraticCurveTo(driverX + 24, driverY + 2, x + 84, handleY + 15);
      context.stroke();

      // Backdrop frame details
      context.strokeStyle = "rgba(221, 208, 170, 0.6)";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(x - 70, y - 60);
      context.lineTo(x + 70, y - 48);
      context.moveTo(x - 60, y - 32);
      context.lineTo(x + 66, y - 22);
      context.stroke();

      context.restore();
    };

    const drawForeground = () => {
      foregroundScroll = (foregroundScroll - 0.8) % CANVAS_WIDTH;
      context.fillStyle = "rgba(90, 96, 90, 0.35)";
      context.fillRect(
        -CANVAS_WIDTH + foregroundScroll,
        CANVAS_HEIGHT * 0.85,
        CANVAS_WIDTH * 2,
        CANVAS_HEIGHT * 0.2
      );

      context.fillStyle = "rgba(255, 255, 255, 0.085)";
      for (let i = 0; i < 12; i += 1) {
        const x = ((i * 120 + foregroundScroll * 2) % (CANVAS_WIDTH + 120)) - 60;
        context.beginPath();
        context.ellipse(
          x,
          CANVAS_HEIGHT * 0.83 + Math.sin(i * 1.3) * 6,
          86,
          22,
          0,
          0,
          Math.PI * 2
        );
        context.fill();
      }
    };

    const drawFog = (delta: number) => {
      fogLayers.forEach((layer) => {
        layer.offset -= (layer.speed * delta) / 1000;
        if (layer.offset < -CANVAS_WIDTH - 200) {
          layer.offset = CANVAS_WIDTH + Math.random() * 400;
        }

        const gradient = context.createLinearGradient(
          layer.offset - 120,
          layer.y,
          layer.offset + 180,
          layer.y + layer.height
        );
        gradient.addColorStop(0, `rgba(180, 190, 198, 0)`);
        gradient.addColorStop(0.4, `rgba(180, 190, 198, ${layer.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(180, 190, 198, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.ellipse(
          layer.offset % (CANVAS_WIDTH + 200) - 100,
          layer.y,
          200,
          layer.height,
          0,
          0,
          Math.PI * 2
        );
        context.fill();
      });
    };

    const render = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(dpr, dpr);

      drawBackground();
      drawSkyline();
      drawRoad(timestamp);
      drawRickshaw(timestamp);
      drawForeground();
      drawFog(delta);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[960px] cursor-grab rounded-3xl border border-white/10 bg-black/10 shadow-[0_40px_140px_rgba(0,0,0,0.45)]"
    />
  );
}

