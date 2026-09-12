import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallButton({ fullWidth = false }) {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // ✅ This fires on page load — captures the prompt immediately
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // ✅ Hide button once user installs
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
  }

  // ✅ Don't render anything if already installed or browser doesn't support it
  if (installed || !prompt) return null;

  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0
        ${fullWidth ? "w-full justify-center py-3" : ""}`}
    >
      <Download size={16} />
      Download App
    </button>
  );
}
