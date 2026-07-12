import { NextResponse } from "next/server";

const systemPrompt = `You are SmartStay AI, a concise bilingual travel assistant for Palestinian stays. Recommend only these verified demo stays: Gaza Seafront House in Gaza $118, Palm Court Resort in Jericho $165, The Stone House in Bethlehem $138, Manara Urban Suites in Ramallah $96, Gerizim View Chalet in Nablus $122, Old City Courtyard in Hebron $74, Olive Grove Farmstay in Tulkarm $88, and Jenin Hills Villa $149. Reply in the user's language and explain the match briefly.`;

function freeFallback(message: string) {
  const text = message.toLowerCase();
  const arabic = /[\u0600-\u06ff]/.test(message);
  if (text.includes("gaza") || text.includes("غزة") || text.includes("sea") || text.includes("بحر")) return arabic ? "أنسب خيار لك هو دار شاطئ غزة في حي الرمال: إطلالة بحرية، تراس خاص، مساحة عائلية وسعر 118 دولارًا لليلة." : "Gaza Seafront House in Al-Rimal is your strongest match: sea view, private terrace, family space and $118 per night.";
  if (text.includes("pool") || text.includes("مسبح")) return arabic ? "للمسبح الخاص أرشح منتجع ساحة النخيل في أريحا، وللمسبح المدفأ أرشح شاليه إطلالة جرزيم في نابلس." : "For a private pool choose Palm Court Resort in Jericho; for a heated pool choose Gerizim View Chalet in Nablus.";
  if (text.includes("romantic") || text.includes("رومانسي")) return arabic ? "البيت الحجري في بيت لحم هو الأنسب: خصوصية، حجر فلسطيني أصيل وإطلالة هادئة." : "The Stone House in Bethlehem is the best romantic fit: privacy, Palestinian stone and calm hill views.";
  if (text.includes("budget") || text.includes("cheap") || text.includes("ميزانية") || text.includes("رخيص")) return arabic ? "أفضل قيمة هي دار البلدة القديمة في الخليل بسعر 74 دولارًا، ثم مزرعة بستان الزيتون في طولكرم بسعر 88 دولارًا." : "Best value: Old City Courtyard in Hebron at $74, followed by Olive Grove Farmstay in Tulkarm at $88.";
  return arabic ? "أخبرني بالمدينة والميزانية وعدد الضيوف والخدمات المطلوبة، وسأرتب لك أفضل الإقامات الفلسطينية." : "Tell me the city, budget, guest count and must-have amenities, and I will rank the best Palestinian stays.";
}

export async function POST(request: Request) {
  const { message = "" } = await request.json() as { message?: string };
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "qwen2.5:3b", prompt: `${systemPrompt}\n\nUser request: ${message}`, stream: false }),
      signal: AbortSignal.timeout(2200),
    });
    if (response.ok) {
      const data = await response.json() as { response?: string };
      if (data.response) return NextResponse.json({ answer: data.response, engine: "ollama" });
    }
  } catch { /* Ollama is optional. */ }
  return NextResponse.json({ answer: freeFallback(message), engine: "local" });
}
