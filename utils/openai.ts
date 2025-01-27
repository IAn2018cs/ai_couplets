import type { Couplet } from "~/types";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_ENDPOINT,
  apiKey: process.env.OPENAI_API_KEY,
});

const extractJSON = (response: string): string => {
  response = response.replace(/```(json)?\n?/g, "").trim();
  const jsonStart = response.indexOf("{");
  const jsonEnd = response.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON found in response");
  }
  return response.slice(jsonStart, jsonEnd + 1);
};

export const generateCouplet = async (prompt: string): Promise<Couplet> => {
  prompt = prompt.trim();

  const systemPrompt = `
根据我的提示生成一副春联，要求包含上、下联，每句话需保持五至十二字，且上下联字数必须一致，然后根据上下联给出不超过五个字的横批，同时总结全文给出一个字的总结。不能出现任何标点符号，不使用生僻字，并按照下面格式输出，确保可以被JSON.parse正确解析，注意全部使用半角符号，不要有任何多余的解释内容。
{
  "上联": "",
  "下联": "",
  "横批": "",
  "总结": ""
}
`;

  const presetMessages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  if (prompt) {
    presetMessages.push({
      role: "user",
      content: `提示词：${prompt}`,
    });
  }

  const completion = await openai.chat.completions.create({
    messages: presetMessages,
    model: process.env.OPENAI_MODEL || "deepseek-chat",
    temperature: 1.5,
  });

  console.log(completion.choices[0].message.content);

  const jsonStr = extractJSON(completion.choices[0].message.content as string);
  return JSON.parse(jsonStr);
};
