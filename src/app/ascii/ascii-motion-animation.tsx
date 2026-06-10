'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// Compact cell format: [x, y, char, colorIndex, bgColorIndex?]
type CellData = [number, number, string, number, number?];

type Frame = {
  duration: number;
  cells: CellData[];
};

type AsciiMotionComponentProps = {
  showControls?: boolean;
  autoPlay?: boolean;
  onReady?: (api: {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    restart: () => void;
  }) => void;
};

const COLORS: string[] = ["#000000","#7f7f7f","#cd0000","#cdcd00","#e5e5e5","#ff0000","#ffff00","#ffffff"];

const FRAMES: Frame[] = [{"duration":83.33333333333333,"cells":[[64,2,"░",0],[73,2,"░",0],[34,3,"░",1],[35,3,"▒",1],[36,3,"░",1],[41,3,"░",0],[62,3,"░",0],[63,3,"░",0],[64,3,"▒",2],[65,3,"░",1],[66,3,"░",0],[67,3,"░",0],[70,3,"▒",1],[71,3,"░",0],[72,3,"▒",2],[73,3,"░",0],[74,3,"░",0],[23,4,"░",0],[25,4,"░",0],[26,4,"▒",2],[27,4,"░",0],[30,4,"░",0],[33,4,"▒",1],[34,4,"█",1],[35,4,"█",1],[36,4,"█",4],[37,4,"█",2],[39,4,"▓",2],[40,4,"░",0],[59,4,"░",1],[61,4,"▒",2],[62,4,"█",3],[63,4,"█",5],[64,4,"█",5],[65,4,"█",1],[66,4,"█",3],[67,4,"█",3],[68,4,"▒",2],[19,5,"░",0],[20,5,"░",0],[21,5,"▒",2],[22,5,"▓",2],[23,5,"█",2],[24,5,"░",0],[25,5,"░",0],[31,5,"▒",1],[32,5,"█",3],[33,5,"█",3],[34,5,"▓",2],[35,5,"░",1],[36,5,"░",1],[58,5,"█",2],[59,5,"█",5],[60,5,"█",2],[61,5,"░",0],[62,5,"░",0],[65,5,"░",1],[66,5,"░",0],[67,5,"░",1],[19,6,"█",5],[20,6,"▓",2],[21,6,"█",3],[22,6,"▒",2],[24,6,"▒",2],[25,6,"░",0],[29,6,"█",3],[30,6,"█",2],[56,6,"█",4],[57,6,"█",3],[58,6,"░",0],[59,6,"▒",1],[61,6,"░",0],[20,7,"█",3],[21,7,"█",5],[22,7,"░",0],[27,7,"░",0],[28,7,"█",4],[29,7,"░",1],[53,7,"░",0],[54,7,"█",4],[55,7,"█",4],[56,7,"░",0],[59,7,"░",0],[61,7,"░",0],[62,7,"░",0],[63,7,"░",0],[20,8,"█",2],[21,8,"░",0],[26,8,"░",1],[27,8,"█",6],[28,8,"█",2],[29,8,"░",0],[30,8,"▓",2],[31,8,"░",0],[35,8,"░",0],[49,8,"░",0],[50,8,"░",0],[51,8,"█",3],[52,8,"█",7],[53,8,"█",3],[54,8,"░",0],[55,8,"░",0],[56,8,"░",0],[57,8,"░",0],[58,8,"░",0],[59,8,"░",0],[60,8,"░",0],[61,8,"░",0],[62,8,"░",0],[71,8,"▒",2],[73,8,"▓",2],[74,8,"░",0],[9,9,"░",0],[17,9,"░",0],[20,9,"█",3],[21,9,"█",3],[22,9,"░",0],[25,9,"█",3],[26,9,"█",3],[27,9,"█",5],[28,9,"░",0],[29,9,"█",3],[30,9,"░",0],[31,9,"▓",1],[45,9,"▒",2],[46,9,"█",2],[47,9,"█",4],[48,9,"█",4],[49,9,"█",5],[50,9,"▓",2],[51,9,"▒",2],[52,9,"░",0],[54,9,"░",0],[55,9,"░",0],[57,9,"▒",2],[58,9,"█",5],[59,9,"░",0],[60,9,"▒",2],[61,9,"▒",2],[62,9,"░",0],[63,9,"▓",2],[64,9,"█",5],[65,9,"█",3],[66,9,"▒",1],[67,9,"░",0],[69,9,"▓",2],[70,9,"█",3],[71,9,"░",0],[72,9,"░",0],[73,9,"▒",2],[74,9,"░",0],[75,9,"░",0],[5,10,"░",1],[6,10,"▒",1],[7,10,"█",5],[8,10,"▓",2],[9,10,"░",0],[10,10,"░",0],[17,10,"░",0],[20,10,"▒",1],[21,10,"█",6],[22,10,"█",5],[23,10,"█",5],[24,10,"█",3],[25,10,"▒",2],[26,10,"░",0],[40,10,"░",0],[41,10,"░",1],[42,10,"█",3],[43,10,"█",4],[44,10,"█",5],[45,10,"█",5],[46,10,"▓",2],[47,10,"░",0],[66,10,"░",0],[67,10,"░",0],[69,10,"░",0],[70,10,"░",0],[71,10,"▒",2],[72,10,"█",5],[73,10,"█",3],[74,10,"▒",2],[75,10,"░",0],[76,10,"░",0],[77,10,"░",0],[78,10,"░",0],[7,11,"░",0],[8,11,"█",5],[9,11,"░",0],[16,11,"░",0],[17,11,"▒",1],[18,11,"░",0],[20,11,"░",0],[21,11,"█",5],[22,11,"█",3],[23,11,"▒",2],[33,11,"█",3],[34,11,"█",3],[35,11,"█",4],[36,11,"█",4],[37,11,"█",6],[38,11,"█",4],[39,11,"█",4],[40,11,"█",5],[41,11,"▓",2],[43,11,"░",0],[47,11,"█",2],[49,11,"█",3],[50,11,"▓",2],[6,12,"▓",1],[7,12,"▒",1],[8,12,"░",0],[9,12,"█",3],[10,12,"█",3],[11,12,"░",0],[15,12,"▓",2],[20,12,"▒",1],[21,12,"█",4],[22,12,"█",6],[23,12,"░",0],[27,12,"░",0],[28,12,"█",5],[29,12,"█",5],[30,12,"█",5],[31,12,"█",3],[32,12,"█",4],[33,12,"█",3],[34,12,"█",3],[35,12,"█",5],[36,12,"█",5],[37,12,"▒",2],[39,12,"░",0],[40,12,"█",2],[41,12,"▓",2],[42,12,"░",0],[54,12,"░",0],[8,13,"░",0],[9,13,"░",0],[10,13,"▓",2],[11,13,"█",5],[12,13,"█",3],[13,13,"▒",2],[14,13,"█",5],[19,13,"▒",2],[20,13,"█",3],[21,13,"█",5],[22,13,"█",3],[23,13,"░",0],[25,13,"░",0],[26,13,"█",4],[27,13,"█",3],[28,13,"█",4],[29,13,"█",3],[30,13,"█",3],[31,13,"█",2],[32,13,"░",0],[42,13,"░",0],[43,13,"▒",2],[44,13,"▓",2],[45,13,"▒",2],[46,13,"░",0],[11,14,"▒",2],[12,14,"▓",2],[13,14,"█",2],[14,14,"█",3],[15,14,"█",5],[18,14,"█",5],[19,14,"█",3],[20,14,"█",5],[21,14,"█",6],[22,14,"█",4],[23,14,"░",0],[25,14,"█",4],[26,14,"█",4],[27,14,"█",4],[28,14,"▓",2],[29,14,"░",0],[47,14,"░",0],[48,14,"█",5],[49,14,"▒",1],[50,14,"█",4],[51,14,"▒",1],[52,14,"░",0],[14,15,"█",3],[15,15,"█",3],[16,15,"█",5],[17,15,"█",3],[18,15,"█",5],[19,15,"█",2],[21,15,"█",7],[22,15,"█",3],[23,15,"█",3],[24,15,"█",4],[25,15,"█",5],[26,15,"░",0],[30,15,"▒",2],[31,15,"░",0],[51,15,"░",1],[52,15,"█",4],[59,15,"░",0],[15,16,"█",5],[16,16,"█",3],[17,16,"█",3],[18,16,"▒",2],[20,16,"▒",2],[21,16,"█",7],[22,16,"█",6],[23,16,"█",5],[24,16,"░",0],[25,16,"░",0],[54,16,"░",0],[55,16,"▓",2],[56,16,"▒",2],[57,16,"▓",2],[58,16,"░",0],[59,16,"░",0],[61,16,"░",0],[15,17,"▓",1],[16,17,"█",3],[17,17,"█",5],[18,17,"▒",2],[20,17,"█",3],[21,17,"█",3],[22,17,"▓",2],[15,18,"▒",1],[16,18,"█",4],[17,18,"█",3],[18,18,"▓",2],[19,18,"█",4],[20,18,"█",6],[21,18,"░",0],[16,19,"█",7],[17,19,"█",6],[18,19,"█",5],[19,19,"█",4],[20,19,"█",2],[16,20,"█",7],[17,20,"█",4],[18,20,"█",3],[19,20,"▓",2],[20,20,"▒",1],[21,20,"█",5]]}];

const CANVAS_WIDTH = 864;
const CANVAS_HEIGHT = 432;
const CELL_WIDTH = 10.8;
const CELL_HEIGHT = 18;
const FONT_SIZE = 18;
const FONT_FAMILY = "SF Mono, Monaco, Cascadia Code, Consolas, JetBrains Mono, Fira Code, Monaspace Neon, Geist Mono, Courier New, monospace";
const BACKGROUND_COLOR = null;

const AsciiMotionAnimation = (props: AsciiMotionComponentProps = {}) => {
  const { showControls = true, autoPlay = true, onReady } = props;
  const controlsVisible = showControls !== false;
  const initialAutoPlay = autoPlay !== false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameIndexRef = useRef<number>(0);
  const frameElapsedRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const restartRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef<boolean>(initialAutoPlay);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialAutoPlay);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const updatePlayingState = useCallback((value: boolean) => {
    isPlayingRef.current = value;
    setIsPlaying(value);
  }, []);
  const play = useCallback(() => {
    updatePlayingState(true);
  }, [updatePlayingState]);
  const pause = useCallback(() => {
    updatePlayingState(false);
  }, [updatePlayingState]);
  const togglePlay = useCallback(() => {
    updatePlayingState(!isPlayingRef.current);
  }, [updatePlayingState]);
  const restart = useCallback(() => {
    if (restartRef.current) {
      restartRef.current();
    }
  }, []);

  useEffect(() => {
    if (isPlayingRef.current !== initialAutoPlay) {
      updatePlayingState(initialAutoPlay);
    }
  }, [initialAutoPlay, updatePlayingState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * devicePixelRatio;
    canvas.height = CANVAS_HEIGHT * devicePixelRatio;
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';
    context.resetTransform();
    context.scale(devicePixelRatio, devicePixelRatio);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = FONT_SIZE + 'px ' + FONT_FAMILY;
    context.imageSmoothingEnabled = false;

    frameIndexRef.current = 0;
    frameElapsedRef.current = 0;
    lastTimestampRef.current = 0;

    const drawFrame = (index: number) => {
      const frame = FRAMES[index];

      if (BACKGROUND_COLOR) {
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (!frame) {
        return;
      }

      for (const cell of frame.cells) {
        const x = cell[0];
        const y = cell[1];
        const char = cell[2];
        const color = COLORS[cell[3]];
        const bgIndex = cell[4];
        const bgColor = bgIndex !== undefined ? COLORS[bgIndex] : null;

        if (bgColor) {
          context.fillStyle = bgColor;
          context.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
        }

        context.fillStyle = color || '#ffffff';
        context.fillText(
          char,
          x * CELL_WIDTH + CELL_WIDTH / 2,
          y * CELL_HEIGHT + CELL_HEIGHT / 2
        );
      }

      setActiveFrame(index);
    };

    drawFrame(frameIndexRef.current);

    if (FRAMES.length === 0) {
      restartRef.current = () => {
        drawFrame(0);
        setActiveFrame(0);
      };
      return;
    }

    const step = (timestamp: number) => {
      if (FRAMES.length === 0) {
        return;
      }

      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }

      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (isPlayingRef.current) {
        frameElapsedRef.current += delta;

        let nextIndex = frameIndexRef.current;
        let remaining = frameElapsedRef.current;
        let duration = FRAMES[nextIndex]?.duration ?? 16;

        while (remaining >= duration && FRAMES.length > 0) {
          remaining -= duration;
          nextIndex = (nextIndex + 1) % FRAMES.length;
          duration = FRAMES[nextIndex]?.duration ?? duration;
        }

        frameElapsedRef.current = remaining;

        if (nextIndex !== frameIndexRef.current) {
          frameIndexRef.current = nextIndex;
          drawFrame(nextIndex);
        } else {
          drawFrame(frameIndexRef.current);
        }
      } else {
        drawFrame(frameIndexRef.current);
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    restartRef.current = () => {
      frameIndexRef.current = 0;
      frameElapsedRef.current = 0;
      lastTimestampRef.current = 0;
      drawFrame(0);
      setActiveFrame(0);
    };

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof onReady === "function") {
      onReady({
        play,
        pause,
        togglePlay,
        restart,
      });
    }
  }, [onReady, play, pause, togglePlay, restart]);

  const hasFrames = FRAMES.length > 0;

  const handleTogglePlay = () => {
    if (!hasFrames) {
      return;
    }
    togglePlay();
  };

  const handleRestart = () => {
    if (!hasFrames) {
      return;
    }
    restart();
    updatePlayingState(true);
  };

  const playLabel = isPlaying ? 'Pause' : 'Play';
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: CANVAS_WIDTH + 'px',
          height: CANVAS_HEIGHT + 'px',
          backgroundColor: BACKGROUND_COLOR || 'transparent',
          imageRendering: 'pixelated'
        }}
      />
      {controlsVisible && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!hasFrames}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              background: isPlaying ? '#f1f5f9' : '#111827',
              color: isPlaying ? '#111827' : '#f9fafb',
              ...(hasFrames ? {} : { cursor: 'not-allowed' }),
            }}
          >
            {playLabel}
          </button>
          <button
            type="button"
            onClick={handleRestart}
            disabled={!hasFrames}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              background: '#0f172a',
              color: '#f9fafb',
              ...(hasFrames ? {} : { cursor: 'not-allowed' }),
            }}
          >
            Restart
          </button>
          <span
            style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}
          >
            {hasFrames ? 'Frame ' + (activeFrame + 1) + ' / ' + FRAMES.length : 'No frames'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AsciiMotionAnimation;
