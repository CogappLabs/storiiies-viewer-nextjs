import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	showArrow?: boolean;
}

// Cogapp button styles: color inversion on hover, 1px border
const variantStyles: Record<ButtonVariant, string> = {
	primary:
		"bg-cogapp-charcoal text-cogapp-cream border-cogapp-cream hover:bg-cogapp-cream hover:text-cogapp-charcoal",
	secondary:
		"bg-cogapp-cream text-cogapp-charcoal border-cogapp-charcoal hover:bg-cogapp-charcoal hover:text-cogapp-cream",
	ghost: "bg-transparent text-cogapp-cream border-transparent hover:text-white",
	danger:
		"bg-transparent text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
};

// Cogapp sizing: 8px 12px 6px 12px padding, 16px font, 500 weight
const sizeStyles: Record<ButtonSize, string> = {
	sm: "pt-1 pb-0.5 px-2 text-sm",
	md: "pt-2 pb-1.5 px-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className = "",
			variant = "primary",
			size = "md",
			showArrow,
			disabled,
			children,
			...props
		},
		ref,
	) => {
		// Default: show arrow for primary buttons
		const displayArrow = showArrow ?? variant === "primary";

		return (
			<button
				ref={ref}
				className={`
					inline-flex items-center
					font-medium leading-7
					border
					focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2
					disabled:opacity-50 disabled:cursor-not-allowed
					transition-colors
					${variantStyles[variant]}
					${sizeStyles[size]}
					${className}
				`}
				disabled={disabled}
				{...props}
			>
				{children}
				{displayArrow && (
					<span
						className="ml-2 transition-transform group-hover:translate-x-1"
						aria-hidden="true"
					>
						→
					</span>
				)}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
