import { useState, useRef } from 'react';

/**
 * Custom hook for handling swipe gestures to open/close a panel.
 * @param {boolean} isOpen - Whether the panel is currently open.
 * @param {function} setIsOpen - Function to set the panel open state.
 * @param {number} panelWidth - The width of the panel in pixels.
 * @returns {object} Swipe handlers and state.
 */
function usePanelSwipe(isOpen, setIsOpen, panelWidth) {
    const touchStartX = useRef(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current === null) return;

        const currentX = e.touches[0].clientX;
        const delta = currentX - touchStartX.current;

        if (isOpen) {
            // When open, only allow dragging left (negative delta) to close.
            const newOffset = Math.min(0, delta);
            setDragOffset(newOffset);
        } else {
            // When closed, only allow dragging right (positive delta) to open.
            // Clamp to panel width.
            const newOffset = Math.max(0, Math.min(delta, panelWidth));
            setDragOffset(newOffset);
        }
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null) return;

        const threshold = panelWidth * 0.3; // 30% of panel width to trigger

        if (isOpen) {
            // If dragged left more than threshold, close.
            if (dragOffset < -threshold) {
                setIsOpen(false);
            }
        } else {
            // If dragged right more than threshold, open.
            if (dragOffset > threshold) {
                setIsOpen(true);
            }
        }

        // Reset.
        touchStartX.current = null;
        setDragOffset(0);
        setIsDragging(false);
    };

    // Calculate panel transform based on drag state (mobile only).
    const getPanelStyle = () => {
        if (!isDragging || typeof window === 'undefined' || window.innerWidth > 768) return {};

        if (isOpen) {
            // Panel is open (at translateX(0)), dragging left to close.
            return { transform: `translateX(${dragOffset}px)` };
        } else {
            // Panel is closed (at translateX(-100%)), dragging right to open.
            return { transform: `translateX(calc(-100% + ${dragOffset}px))` };
        }
    };

    return {
        isDragging,
        dragOffset,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        getPanelStyle,
    };
}

export default usePanelSwipe;
