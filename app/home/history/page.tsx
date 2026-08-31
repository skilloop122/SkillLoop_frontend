"use client";

import React, { useEffect } from "react";
import { ArrowLeft, Star, Flame, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { SideNav } from "../../../components/SideNav";
import { usePointsStore, type PointTransaction } from "../../../lib/pointsStore";
import { useAuthStore } from "../../../lib/authStore";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function reasonLabel(reason: string): string {
  const map: Record<string, string> = {
    WELCOME_BONUS: "🎉 Welcome Bonus",
    SESSION_COMPLETED: "✅ Session Completed",
    SKILL_LEARNED: "📚 Skill Learned",
    FEEDBACK_REWARD: "⭐ Feedback Reward",
    STREAK_REWARD: "🔥 Streak Reward",
    REFERRAL_REWARD: "🔗 Referral Reward",
    SESSION_DEDUCTED: "💸 Session Cost",
    ESCROW_RELEASE: "🔓 Escrow Released",
    ESCROW_HOLD: "🔒 Escrow Hold",
  };
  return map[reason] ?? reason.replace(/_/g, " ");
}

// ─── transaction row ─────────────────────────────────────────────────────────

function TransactionRow({ tx, runningTotal }: { tx: PointTransaction; runningTotal: number }) {
  const positive = tx.amount >= 0;
  return (
    <div className="flex justify-between items-center px-4 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-[0_2px_12px_rgba(14,165,233,0.06)] hover:bg-white/80 transition-all">
      <div className="flex items-center gap-3">
        {/* icon bubble */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${positive ? "bg-green-50" : "bg-red-50"}`}>
          {positive
            ? <TrendingUp className="w-4 h-4 text-green-500" />
            : <TrendingDown className="w-4 h-4 text-red-400" />}
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-slate-800 mb-0.5">
            {reasonLabel(tx.reason)}
          </span>
          <span className="text-[12px] text-slate-400">{formatDate(tx.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 ml-4">
        <span className={`text-[15px] font-bold ${positive ? "text-green-600" : "text-red-500"}`}>
          {positive ? `+${tx.amount}` : tx.amount}
        </span>
        <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-0.5">
          {runningTotal} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
        </span>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const { data, loading, error, fetchPointsHistory } = usePointsStore();
  const { hydrated, token } = useAuthStore();

  useEffect(() => {
    if (hydrated && token) {
      fetchPointsHistory();
    }
  }, [hydrated, token, fetchPointsHistory]);

  const transactions = data?.transactions ?? [];

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const withTotals: { tx: PointTransaction; running: number }[] = [];
  let running = 0;
  for (const tx of [...sorted].reverse()) {
    running += tx.amount;
    withTotals.push({ tx, running });
  }
  const displayRows = [...withTotals].reverse();

  return (
    <div
      className="min-h-screen font-sans pb-10 flex"
      style={{
        background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 40%, #f8fafc 70%, #ede9fe 100%)",
      }}
    >
      <SideNav />
      <div className="flex-1 w-full md:ml-64">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-12 md:pt-16">

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl flex items-center justify-center mb-6 hover:bg-white/90 shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2} />
          </button>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/70 shadow-lg flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <p className="text-[15px] text-slate-400 font-medium">Loading your points…</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/70 shadow-lg flex flex-col items-center gap-4">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-[15px] text-red-500 text-center font-medium">{error}</p>
                <button
                  onClick={fetchPointsHistory}
                  className="rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-2.5 text-white text-[14px] font-semibold transition-all shadow-md shadow-sky-200"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* ── Available Points Card ── */}
              <div className="relative rounded-3xl p-6 mb-8 overflow-hidden text-white shadow-xl shadow-sky-300/30"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)" }}
              >
                {/* glass orb decorations */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

                <h2 className="text-[16px] font-semibold opacity-90 mb-1 relative z-10">Available Points</h2>
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-end gap-2">
                    <span className="text-[56px] font-bold leading-none tracking-tight">
                      {data.availablePoints}
                    </span>
                    <Star className="w-8 h-8 fill-amber-300 text-amber-300 mb-2" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 flex flex-col items-center border border-white/30 shadow-inner">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold">{data.points}</span>
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      </div>
                      <span className="text-[10px] font-medium opacity-80">Total</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 flex flex-col items-center border border-white/30 shadow-inner">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold">{data.escrowPoints}</span>
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      </div>
                      <span className="text-[10px] font-medium opacity-80">Escrow</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Your Activity ── */}
              <div className="mb-8">
                <h2 className="text-[20px] font-semibold text-slate-800 mb-4">Your Activity</h2>
                <div className="grid grid-cols-3 gap-3">
                  {/* Streak */}
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/75 transition-all h-22.5">
                    <div className="flex items-center gap-1 mb-1">
                      <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-[18px] font-bold text-slate-800">{data.streakCount}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">Day Streak</span>
                  </div>

                  {/* Skills */}
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/75 transition-all h-22.5">
                    <span className="text-[18px] font-bold text-slate-800 mb-1">
                      {transactions.filter(t => t.reason === "SKILL_LEARNED").length}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 leading-tight">Skills Learned</span>
                  </div>

                  {/* Sessions */}
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/75 transition-all h-22.5">
                    <span className="text-[18px] font-bold text-slate-800 mb-1">
                      {transactions.filter(t => t.reason === "SESSION_COMPLETED").length}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 leading-tight">Sessions Done</span>
                  </div>
                </div>
              </div>

              {/* ── Points History ── */}
              <div className="mb-10">
                <h2 className="text-[20px] font-semibold text-slate-800 mb-4">Skill Points History</h2>

                {displayRows.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl py-12 text-center shadow-sm">
                    <p className="text-[15px] text-slate-400 font-medium">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {displayRows.map(({ tx, running: total }) => (
                      <TransactionRow key={tx.id} tx={tx} runningTotal={total} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
