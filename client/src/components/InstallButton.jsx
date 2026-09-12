import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

export default function InstallButton({ fullWidth = false }) {
  const [prompt, setPrompt]         = useState(null);
  const [installed, setInstalled]   = useState(false);
  const [isIOS, setIsIOS]           = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Already installed as standalone app → hide button
    const already =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (already) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowIOSTip((v) => !v);
      return;
    }
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setPrompt(null);
    } else {
      // manifest/sw not ready yet — tell user
      alert(
        "To install: open this site in Chrome on Android, tap the 3-dot menu → 'Add to Home Screen'"
      );
    }
  }

  // Only hide if already installed as an app
  if (installed) return null;

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`}>
      <button
        onClick={handleInstall}
        className={`flex items-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0
          ${fullWidth
            ? "w-full justify-center px-4 py-3"
            : "px-4 py-2.5"
          }`}
      >
        {isIOS ? <Smartphone size={16} /> : <Download size={16} />}
        Download App
      </button>

      {/* iOS instructions popup */}
      {isIOS && showIOSTip && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="text-sm font-bold text-slate-800 mb-2">
            Install on iPhone
          </p>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              Open in <span className="font-semibold">Safari</span> browser
            </li>
            <li>
              Tap the <span className="font-semibold">Share</span> button{" "}
              <span className="text-base">⎋</span> at the bottom
            </li>
            <li>
              Tap <span className="font-semibold">"Add to Home Screen"</span>
            </li>
            <li>
              Tap <span className="font-semibold">Add</span>
            </li>
          </ol>
          <button
            onClick={() => setShowIOSTip(false)}
            className="mt-3 w-full rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-600"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}