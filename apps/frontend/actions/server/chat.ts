"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendChatMessage(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "너는 유용한 조언자야. 오늘 로그를 보고 칭찬과 개선점을 함께 알려줘. 또한 오늘 섭취한 음식과 영양 상태를 분석하고, 목표 칼로리와 비교해 부족하거나 과한 부분이 있다면 어떻게 조정하면 좋을지 짧게 조언해줘. 답변은 반드시 300자 이내로 작성해줘. 만약 정보가 없다면, '정보가 부족하여 조언을 제공할 수 없습니다.'라고 하고 그냥 꿀팁이나 지식같은걸 줘.",
        // "너는 유용한 조언자야. 오늘 로그의 내용으로, 관련 명언이나 좋은 말 혹은 예시와 함께 어떻게 행동하면 더 나은 사람이 될 수 있는지도 구체적으로 알려줘. 답변은 반드시 300자 이내로 작성해줘. 만약 정보가 없다면, '정보가 부족하여 조언을 제공할 수 없습니다.'라고 하고 그냥 꿀팁이나 지식같은걸 줘.",
      },
      { role: "user", content: message },
    ],
  });

  return completion.choices[0]?.message.content ?? null;
}

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
