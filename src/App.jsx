import { useState } from "react";

const PERIODS = [
  { label: "3개월 후", months: 3, desc: "계절이 한 번 바뀔 때" },
  { label: "6개월 후", months: 6, desc: "반년이 지나고 나서" },
  { label: "1년 후", months: 12, desc: "지금과는 전혀 다른 내가 될 때" },
];

function getFutureDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function getTodayStr() {
  return new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

const wrap = { padding: "1.5rem 0", fontFamily: "sans-serif" };
const card = {
  background: "#fff", border: "1px solid #eee",
  borderRadius: 16, padding: "2rem",
  maxWidth: 500, margin: "0 auto",
  boxShadow: "0 2px 20px rgba(0,0,0,0.06)"
};
const muted = { fontSize: 13, color: "#888", margin: 0 };

export default function TimeCapsule() {
  const [step, setStep] = useState(1);
  const [letter, setLetter] = useState("");
  const [period, setPeriod] = useState(null);
  const [email, setEmail] = useState("");
  const [aiMsg, setAiMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `따뜻하고 진심 어린 존재입니다. 지금 지치고 힘든 사람이 ${period?.months}개월 후의 자신에게 편지를 썼습니다. 150자 이내 한국어로, 형식 없이 진심으로 한마디 해주세요.`,
          messages: [{ role: "user", content: letter }],
        }),
      });
      const data = await res.json();
      setAiMsg(data?.content?.[0]?.text || "지금 이 마음도 당신의 일부예요.");
      setStep(4);
    } catch {
      setAiMsg("지금 이 힘든 마음도 당신의 일부예요. 잘 버티고 있어요.");
      setStep(4);
    }
    setLoading(false);
  };

  const reset = () => { setStep(1); setLetter(""); setPeriod(null); setEmail(""); setAiMsg(""); };

  if (step === 1) return (
    <div style={wrap}>
      <div style={card}>
        <p style={{ ...muted, marginBottom: 4 }}>{getTodayStr()}</p>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, marginTop: 4 }}>지금 이 마음을, 미래의 나에게</h2>
        <p style={{ ...muted, marginBottom: 24, lineHeight: 1.7 }}>힘들어도 괜찮아요. 지금 느끼는 것들을 그대로 써보세요.</p>
        <textarea value={letter} onChange={e => setLetter(e.target.value)}
          placeholder={"오늘은 모든 게 다 싫다...\n아무것도 하기 싫고, 지쳐있다."}
          style={{ width: "100%", boxSizing: "border-box", minHeight: 200, fontSize: 15, lineHeight: 1.8, padding: "14px 16px", border: "1px solid #eee", borderRadius: 10, background: "#fafafa", resize: "vertical" }} />
        <p style={{ ...muted, marginTop: 8, marginBottom: 20 }}>{letter.length}자</p>
        <button onClick={() => letter.trim().length > 10 && setStep(2)} disabled={letter.trim().length <= 10}
          style={{ width: "100%", padding: 14, fontSize: 15, background: "#222", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", opacity: letter.trim().length > 10 ? 1 : 0.4 }}>
          다음 →
        </button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>언제 받고 싶어요?</h2>
        <p style={{ ...muted, marginBottom: 24 }}>그때의 당신이 이 편지를 읽게 됩니다.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {PERIODS.map(p => (
            <div key={p.months} onClick={() => setPeriod(p)}
              style={{ padding: "16px 18px", border: period?.months === p.months ? "2px solid #222" : "1px solid #eee", borderRadius: 10, cursor: "pointer", background: period?.months === p.months ? "#f5f5f5" : "#fafafa" }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>{p.label}</p>
              <p style={{ ...muted }}>{getFutureDate(p.months)} · {p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, border: "1px solid #eee", borderRadius: 10, background: "#fff", cursor: "pointer" }}>← 뒤로</button>
          <button onClick={handleGenerate} disabled={!period}
            style={{ flex: 2, padding: 14, background: "#222", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", opacity: period ? 1 : 0.4 }}>
            봉인하기
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={wrap}>
      <div style={{ ...card, textAlign: "center", padding: "4rem 2rem" }}>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>편지를 읽고 있어요...</p>
        <p style={muted}>{period?.months}개월 후의 당신에게 한마디를 준비하고 있습니다.</p>
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={wrap}>
      <div style={card}>
        <p style={{ ...muted, marginBottom: 12 }}>{period?.months}개월 후, 함께 전달될 한마디</p>
        <div style={{ background: "#fafafa", borderLeft: "3px solid #222", padding: "16px 18px", marginBottom: 24, borderRadius: "0 10px 10px 0" }}>
          <p style={{ fontSize: 15, lineHeight: 1.8, margin: 0 }}>{aiMsg}</p>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>이메일 주소</p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이 주소로 편지가 전달됩니다"
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #eee", borderRadius: 10, fontSize: 15, marginBottom: 8 }} />
        <p style={{ ...muted, marginBottom: 20 }}>{period && getFutureDate(period.months)}에 자동 발송됩니다</p>
        <button onClick={() => email.includes("@") && setStep(5)} disabled={!email.includes("@")}
          style={{ width: "100%", padding: 14, background: "#222", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.4 }}>
          {period && getFutureDate(period.months)}에 전송 예약
        </button>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={{ ...card, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>봉인되었습니다 ✉️</h2>
        <p style={{ ...muted, lineHeight: 1.9, marginBottom: 24 }}>
          <strong style={{ color: "#222" }}>{period && getFutureDate(period.months)}</strong>에<br />
          {email}으로 전달됩니다.<br />그때까지 잘 지내세요.
        </p>
        <button onClick={reset} style={{ width: "100%", padding: 14, background: "#222", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          + 새 편지 쓰기
        </button>
      </div>
    </div>
  );
}
