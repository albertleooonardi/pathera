import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";

const LoadingButton = ({
  className = "",
  text = "Loading...",
  variant,
  size,
}: {
  className?: string;
  text?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) => {
  return (
    <Button
      disabled
      variant={variant}
      size={size}
      className={className}
      aria-busy="true"
    >
      <Loader2 className="animate-spin" />
      {text}
    </Button>
  );
};

export default LoadingButton;
