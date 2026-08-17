export const APP_NAME = "Synapse";

export function AppLogo({ className = "", size = 32, alt = APP_NAME }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10 border border-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt={alt}
        className="w-full h-full object-cover select-none transform hover:scale-105 transition duration-300"
        draggable={false}
      />
    </div>
  );
}
