'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 120;
const IMAGE_DIR = '/sequence/';

// A utility function to load an image
const loadImage = (index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `${IMAGE_DIR}frame_${index}.webp`;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

export default function IsoTankScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Framer motion scroll tracking inside the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Preload images
    useEffect(() => {
        let mounted = true;
        const preloadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            let loadedCount = 0;

            const loadPromises = Array.from({ length: FRAME_COUNT }).map((_, i) => {
                return loadImage(i)
                    .then((img) => {
                        if (!mounted) return;
                        loadedImages[i] = img;
                        loadedCount++;
                        setLoadingProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
                    })
                    .catch((err) => {
                        console.error("Failed to load image", i, err);
                    });
            });

            await Promise.all(loadPromises);

            if (!mounted) return;
            setImages(loadedImages);
            setIsLoaded(true);
            // Draw initial frame
            drawFrame(loadedImages[0], canvasRef.current);
        };

        preloadImages();

        return () => {
            mounted = false;
        };
    }, []);

    // Frame drawing logic
    const drawFrame = (img: HTMLImageElement | undefined, canvas: HTMLCanvasElement | null) => {
        if (!img || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        // Use logical width/height for calculations
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;

        const scaleFactor = 0.65; // Reduced to 65% size to ensure no edges are ever cut off

        let drawWidth, drawHeight;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image => map to height
            drawHeight = height * scaleFactor;
            drawWidth = drawHeight * imgRatio;
        } else {
            // Canvas is taller than image => map to width
            drawWidth = width * scaleFactor;
            drawHeight = drawWidth / imgRatio;
        }

        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2;

        // Clear the physical canvas area
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    };

    useMotionValueEvent(smoothProgress, "change", (latest) => {
        if (!isLoaded || images.length === 0) return;
        const currentFrame = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(latest * FRAME_COUNT))
        );
        drawFrame(images[currentFrame], canvasRef.current);
    });

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && isLoaded) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;
                canvasRef.current.style.width = `${window.innerWidth}px`;
                canvasRef.current.style.height = `${window.innerHeight}px`;

                // redraw current frame
                const currentFrame = Math.min(
                    FRAME_COUNT - 1,
                    Math.max(0, Math.floor(smoothProgress.get() * FRAME_COUNT))
                );
                drawFrame(images[currentFrame], canvasRef.current);
            }
        };

        handleResize(); // Initial setup
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isLoaded, images, smoothProgress]);

    // No extra scroll indicators or text overlays needed for embed

    return (
        <div ref={containerRef} className="relative h-[250vh] w-full bg-transparent overflow-hidden">

            {/* Sticky container for canvas and text */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-transparent">

                {/* Loading UI */}
                {!isLoaded && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent text-black">
                        <div className="w-64 h-[2px] bg-white/10 rounded overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="mt-6 text-black/50 text-xs tracking-[0.2em] uppercase font-light">
                            Loading Sequence ({loadingProgress}%)
                        </p>
                    </div>
                )}

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-0 m-auto pointer-events-none"
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 1s ease-in-out'
                    }}
                />

                {/* Pure Animation Background. Text removed for minimal embed */}

            </div>
        </div>
    );
}
