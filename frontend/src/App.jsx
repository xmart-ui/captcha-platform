import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  Target,
  LayoutDashboard
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [captcha, setCaptcha] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });

  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [error, setError] = useState("");

  // Load Statistics
  async function loadStats() {
    try {
      const response = await fetch(`${API}/api/captcha/stats`);

      if (response.ok) {
        setStats(await response.json());
      }
    } catch {
      setError("Cannot connect to backend.");
    }
  }

  // Generate New CAPTCHA
  async function generateCaptcha() {
    setLoading(true);
    setResult(null);
    setAnswer("");
    setError("");

    try {
      const response = await fetch(`${API}/api/captcha/new`);

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      setCaptcha(data);

    } catch {
      setError("Backend connection failed. Check FastAPI server.");
    } finally {
      setLoading(false);
    }
  }

  // Manual CAPTCHA Verification
  async function verifyCaptcha(e) {
    e.preventDefault();

    if (!captcha || !answer.trim()) return;

    setLoading(true);
    setResult(null);

    const start = performance.now();

    try {
      const response = await fetch(`${API}/api/captcha/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          captcha_id: captcha.captcha_id,
          answer: answer
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      setProcessingTime(
        ((performance.now() - start) / 1000).toFixed(3)
      );

      setResult(data);
      await loadStats();

    } catch (err) {
      setError(err.message || "Verification request failed.");
    } finally {
      setLoading(false);
    }
  }

  // Automatic CAPTCHA Recognition using OCR
  async function solveAutomatically() {
    if (!captcha) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${API}/api/captcha/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          captcha_id: captcha.captcha_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "OCR failed");
      }

      setResult(data);
      setAnswer(data.recognized_text || "");
      setProcessingTime(data.processing_time ?? null);

      await loadStats();

    } catch (err) {
      setError(err.message || "Automatic OCR request failed.");
    } finally {
      setLoading(false);
    }
  }

  // Initial Loading
  useEffect(() => {
    generateCaptcha();
    loadStats();
  }, []);

  // Calculate Accuracy
  const accuracy = stats.total
    ? ((stats.success / stats.total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-col p-6">

        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-600 p-3 rounded-xl">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1 className="font-bold text-lg">CaptchaGuard</h1>
            <p className="text-xs text-slate-400">
              Testing Platform
            </p>
          </div>
        </div>

        <div className="bg-blue-600/20 text-blue-300 p-3 rounded-xl flex gap-3 items-center">
          <LayoutDashboard size={20} />
          Dashboard
        </div>

        <div className="mt-auto text-xs text-slate-500">
          CAPTCHA Recognition Platform
          <br />
          Version 1.0.0
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full">

        <header className="flex flex-wrap justify-between items-center gap-4 mb-9">

          <div>
            <p className="text-sm text-slate-500">
              Testing Environment
            </p>

            <h2 className="text-3xl font-bold mt-1">
              Dashboard
            </h2>

            <p className="text-slate-500 mt-2">
              CAPTCHA recognition and verification system.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Online
          </div>

        </header>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <StatCard
            title="Total Attempts"
            value={stats.total}
            icon={<Activity />}
          />

          <StatCard
            title="Successful"
            value={stats.success}
            icon={<CheckCircle2 />}
          />

          <StatCard
            title="Failed"
            value={stats.failed}
            icon={<XCircle />}
          />

          <StatCard
            title="Success Rate"
            value={`${accuracy}%`}
            icon={<Target />}
          />

        </div>

        {/* CAPTCHA Testing Panel */}
        <div className="grid lg:grid-cols-3 gap-6">

          <section className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h3 className="font-bold text-xl">
                  CAPTCHA Recognition
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Generate and verify synthetic challenges.
                </p>
              </div>

              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-full">
                Synthetic Text
              </span>

            </div>

            {/* CAPTCHA Image */}
            <div className="bg-slate-50 border rounded-xl p-6 text-center">

              <p className="text-sm text-slate-500 mb-4">
                Your CAPTCHA Challenge
              </p>

              {captcha ? (
                <img
                  src={captcha.image}
                  alt="Synthetic CAPTCHA challenge"
                  className="mx-auto max-w-full rounded-lg border bg-white"
                />
              ) : (
                <div className="py-8 text-slate-400">
                  Loading challenge...
                </div>
              )}

              <button
                onClick={generateCaptcha}
                disabled={loading}
                className="mt-5 inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Generate New CAPTCHA
              </button>

            </div>

            {/* Verification Form */}
            <form onSubmit={verifyCaptcha} className="mt-6">

              <label className="block font-semibold mb-2">
                Enter CAPTCHA Text
              </label>

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the characters shown above"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={20}
                disabled={!captcha || loading || !!result}
              />

              {/* Manual Verification */}
              <button
                type="submit"
                disabled={loading || !captcha || !answer.trim() || !!result}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-4 transition"
              >
                {loading ? "Processing..." : "Verify CAPTCHA"}
              </button>

              {/* Automatic OCR */}
              <button
                type="button"
                onClick={solveAutomatically}
                disabled={loading || !captcha || !!result}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-3"
              >
                🤖 Solve Automatically with OCR
              </button>

            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-5 bg-red-50 text-red-700 p-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                className={`mt-5 p-4 rounded-xl flex gap-3 items-start ${
                  result.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >

                {result.success
                  ? <CheckCircle2 />
                  : <XCircle />
                }

                <div>
                  <p className="font-bold">
                    {result.success
                      ? "Verification Successful"
                      : "Verification Failed"}
                  </p>

                  <p className="text-sm mt-1">
                    {result.message}
                  </p>

                  <p className="text-sm mt-1">
                    Processing time: {processingTime ?? "N/A"}s
                  </p>
                </div>

              </div>
            )}

          </section>

          {/* System Information */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm h-fit">

            <h3 className="font-bold text-lg mb-6">
              System Information
            </h3>

            <Info label="Challenge Type" value="Synthetic Text" />
            <Info label="Solving Method" value="Manual Testing / OCR" />
            <Info label="Backend" value="FastAPI / Python" />
            <Info label="Frontend" value="React / Vite" />
            <Info label="Verification" value="Local API" />

            <div className="border-t mt-5 pt-5">

              <p className="text-sm text-slate-500 mb-2">
                System Status
              </p>

              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle2 size={18} />
                Operational
              </div>

            </div>

          </section>

        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400 mt-10">
          CaptchaGuard Testing Platform © 2026
        </footer>

      </main>

    </div>
  );
}

// Statistics Card
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">

      <div className="text-blue-600 mb-3">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-1">
        {value}
      </h3>

    </div>
  );
}

// Information Component
function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-3 border-b last:border-0 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-right">
        {value}
      </span>

    </div>
  );
}