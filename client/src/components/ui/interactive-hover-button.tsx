import React from "react";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text, children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`interactive-hover-btn group ${className}`}
      {...props}
    >
      <span className="interactive-hover-btn-text">
        {children || text || "Button"}
      </span>
      <div className="interactive-hover-btn-overlay">
        <span>{children || text || "Button"}</span>
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
