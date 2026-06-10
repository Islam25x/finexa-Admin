import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../shared/ui";
import type { UserAction } from "../types/users.types";

interface ActionReasonModalProps {
    open: boolean;
    action: UserAction | null;
    isLoading: boolean;
    onSubmit: (reason: string) => void;
    onClose: () => void;
}

const actionLabels: Record<UserAction, string> = {
    lock: "Lock User",
    unlock: "Unlock User",
    activate: "Activate User",
    deactivate: "Deactivate User",
    "make-admin": "Make Admin",
    "remove-admin": "Remove Admin",
};

export function ActionReasonModal({
    open,
    action,
    isLoading,
    onSubmit,
    onClose,
}: ActionReasonModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (open && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [open]);

    const handleSubmit = () => {
        const trimmed = reason.trim();
        if (!trimmed) {
            setError("Reason is required");
            return;
        }
        onSubmit(trimmed);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        } else if (e.key === "Enter" && e.ctrlKey) {
            handleSubmit();
        }
    };

    const handleClose = () => {
        setReason("");
        setError("");
        onClose();
    };

    if (!open) return null;

    return createPortal(
        <>
            <button
                className="fixed inset-0 z-40 bg-text-primary/30"
                aria-label="Close modal"
                onClick={handleClose}
            />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-text-primary">
                        {action ? actionLabels[action] : "Confirm Action"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-secondary hover:bg-primary/10"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium text-text-secondary"
                        >
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            ref={textareaRef}
                            id="reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter the reason for this action..."
                            className="mt-2 w-full resize-none rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none"
                            rows={4}
                            disabled={isLoading}
                        />
                        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? "Submitting..." : "Confirm"}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    );
}
