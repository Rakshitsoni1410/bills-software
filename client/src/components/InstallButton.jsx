import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Catch the install prompt before browser hides it
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPrompt(e);
    });

    // Hide button once installed
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
    }
  }

  // Don't show if already installed or prompt not available
  if (installed || !prompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
    >
      <Smartphone size={17} />
      Download App
    </button>
  );
}