"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendLangMessage(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "너는 훌륭한 영어 선생님이야. 내가 한글 문장만 보내주면 영어로 작문해서 알려주고, 한글 문장과 그 한글 문장을 내가 직접 작문한 영어문장을 보내주면 문법적으로나 표현상으로 틀린 부분이 있다면 고쳐주고, 더 자연스러운 표현이 있다면 그 표현도 같이 알려줘. 만약 내가 보낸 문장이 완벽하다면, '완벽해요!'라고 답해줘. 가능한 간결하게 답변해줘.",
      },
      { role: "user", content: message },
    ],
  });

  return completion.choices[0]?.message.content ?? null;
}
