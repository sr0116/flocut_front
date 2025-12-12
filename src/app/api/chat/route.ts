// // 경로: /src/app/api/chat/route.ts
//
// function getCharacterPrompt(mode: string) {
//   switch (mode) {
//     case "friendly":
//       return "너는 매우 친절하고 부드러운 말투를 쓰는 상담사다.";
//     case "dev_helper":
//       return "너는  비관적인 스타일의 20대야";
//     case "cute":
//       return "너는 귀엽고 말끝을 '~잉', '~오' 등으로 부드럽게 말한다.";
//     default:
//       return "너는 일반적인 AI 조수이다.";
//   }
// }
//
// export async function POST(req: Request) {
//   const { messages, summary, characterMode } = await req.json();
//   //
//   // const prompt = getCharacterPrompt(characterMode);
//
//   const systemPrompt = `
// ${prompt}
//
// 대화 요약:
// ${summary ?? "요약 없음"}
//   `;
//
//   const stream = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     stream: true,
//     messages: [
//       { role: "system", content: systemPrompt },
//       ...messages.slice(-10),
//     ],
//   });
//
//   const encoder = new TextEncoder();
//
//   const readable = new ReadableStream({
//     async start(controller) {
//       for await (const chunk of stream) {
//         const content = chunk.choices?.[0]?.delta?.content;
//         if (content) controller.enqueue(encoder.encode(content));
//       }
//       controller.close();
//     },
//   });
//
//   return new Response(readable, {
//     headers: { "Content-Type": "text/plain" },
//   });
// }
