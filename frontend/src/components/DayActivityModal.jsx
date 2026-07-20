import React from "react";
import { X, CheckCircle2, Terminal, MessageSquareCode, Award, Sparkles, Calendar } from "lucide-react";

export default function DayActivityModal({ selectedDayData, onClose }) {
  if (!selectedDayData) return null;

  const { dateFormatted, totalEvents, events } = selectedDayData;

  function getEventIcon(type) {
    switch (type) {
      case "quiz":
        return <CheckCircle2 size={16} className="text-moss" />;
      case "task":
        return <Terminal size={16} className="text-rust" />;
      case "ai":
        return <MessageSquareCode size={16} className="text-lavender-dark" />;
      case "badge":
        return <Award size={16} className="text-rust-dark" />;
      default:
        return <Sparkles size={16} className="text-coffee" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="card-base max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-[scaleUp_0.2s_ease-out] bg-card border-hairline">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sand-deep/40 text-coffee">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-coffee">{dateFormatted}</h3>
              <p className="text-xs text-coffee-soft font-mono font-medium">
                {totalEvents} {totalEvents === 1 ? "activity completed" : "activities completed"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-sand-deep/30 text-coffee-soft hover:text-coffee transition-colors"
            aria-label="Close activity detail modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Itemized Events List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-custom">
          {events && events.length > 0 ? (
            events.map((evt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-sand-deep/20 border border-hairline/40 flex items-start gap-3 hover:bg-sand-deep/30 transition-colors"
              >
                <div className="p-2 rounded-xl bg-card border border-hairline/50 mt-0.5 flex-shrink-0">
                  {getEventIcon(evt.type)}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-coffee">{evt.title}</h4>
                    <span className="text-[9px] font-mono font-bold text-coffee-soft bg-sand-deep/50 px-2 py-0.5 rounded-full">
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-coffee-soft leading-relaxed">{evt.detail}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-coffee-soft italic">No activity logged for this date.</p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="btn-primary w-full py-2.5 text-xs font-semibold"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
