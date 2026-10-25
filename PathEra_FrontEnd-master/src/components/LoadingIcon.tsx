const LoadingIcon = ({ color = "hsl(var(--primary))" }: { color?: string }) => {
  return (
    <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full"
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.15}s`,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingIcon;
