// Jika ada trade
if (hasTrade) {
  const dayTrades = dayData.trades;
  const dayR = dayTrades.reduce((sum, t) => sum + (t.result === "Win" ? t.r : t.result === "Loss" ? -t.r : 0), 0);
  const grade = dayTrades[0]?.grade || "B";
  const daySlug = dayKey;

  return (
    <Link key={dayKey} href={`/month/${slug}/week/${weekNum}/day/${daySlug}`} className="rail-row linked">
      <div className="rail-day">
        {dayName}
        <b>{d.getDate()}</b>
      </div>
      <div className="rail-body">
        <h4>{dayTrades.length} trade — {dayTrades.map(t => t.title).join(", ")}</h4>
        <p>{dayTrades.map(t => `${t.instrument} ${t.direction}`).join(" · ")}</p>

        {/* ===== TAMBAHAN: Catatan dari Pra-pasar / Eksekusi / Notes ===== */}
        {dayTrades.some(t => t.praPasar || t.eksekusi || t.notes) && (
          <div className="mt-1 text-sm text-[#A6A39C] italic border-l-2 border-[#56534E] pl-2">
            {dayTrades.map((t, idx) => {
              const note = t.praPasar || t.eksekusi || t.notes || '';
              return note ? <p key={idx} className="whitespace-pre-wrap break-words">“{note.slice(0, 150)}”</p> : null;
            })}
          </div>
        )}

        {hasReading && (
          <p className="text-sm text-[#6E6B65] mt-1">
            📝 + {dayData.readings.length} update reading
          </p>
        )}
      </div>
      <div className={`rail-badge ${dayR >= 0 ? "win" : "loss"}`}>
        <span>{grade}</span>
      </div>
      <div className={`rail-r ${dayR >= 0 ? "win" : "loss"}`}>
        {dayR >= 0 ? "+" : ""}{dayR.toFixed(1)}R
      </div>
    </Link>
  );
}
