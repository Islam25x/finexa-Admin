import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../shared/ui";
import { getAvailableActions } from "../selectors/user-actions.selector";
import type { AdminUser, UserAction } from "../types/users.types";

interface ActionMenuPortalProps {
    user: AdminUser;
    isLoading: boolean;
    isOpen: boolean;
    onActionSelect: (action: UserAction) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

export function ActionMenuPortal({
    user,
    isLoading,
    isOpen: controlledIsOpen,
    onActionSelect,
    onOpen,
    onClose,
}: ActionMenuPortalProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const availableActions = getAvailableActions(user);

    const updatePosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 200;
        const menuWidth = 160;
        const padding = 8;

        let top = rect.bottom + padding;
        let left = rect.right - menuWidth;

        if (top + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight - padding;
        }

        if (left + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - padding;
        }

        if (left < padding) {
            left = padding;
        }

        setPosition({ top, left });
    };

    const handleOpen = () => {
        onOpen?.();
        setTimeout(updatePosition, 0);
    };

    const handleClose = () => {
        onClose?.();
    };

    const handleActionClick = (action: UserAction) => {
        onActionSelect(action);
        handleClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && controlledIsOpen) {
            handleClose();
        }
    };

    const handleOutsideClick = (e: MouseEvent) => {
        if (
            controlledIsOpen &&
            buttonRef.current &&
            menuRef.current &&
            !buttonRef.current.contains(e.target as Node) &&
            !menuRef.current.contains(e.target as Node)
        ) {
            handleClose();
        }
    };

    useEffect(() => {
        if (!controlledIsOpen) return;

        window.addEventListener("keydown", handleEscape);
        window.addEventListener("click", handleOutsideClick);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("keydown", handleEscape);
            window.removeEventListener("click", handleOutsideClick);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [controlledIsOpen]);

    return (
        <>
            <Button
                ref={buttonRef}
                type="button"
                variant="ghost"
                disabled={isLoading}
                aria-label={`Open actions for ${user.email}`}
                onClick={handleOpen}
            >
                <MoreHorizontal size={20} />
            </Button>

            {controlledIsOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[1001] grid min-w-40 rounded-lg border border-border bg-surface p-1.5 shadow-lg"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                    >
                        {availableActions.map((action) => (
                            <button
                                key={action.value}
                                type="button"
                                className="rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-primary/10 disabled:opacity-50"
                                onClick={() => handleActionClick(action.value)}
                                disabled={isLoading}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}
