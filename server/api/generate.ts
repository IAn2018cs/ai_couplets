import { generateCouplet } from "~/utils/openai";

export default defineEventHandler(async (e) => {
  const query = getQuery(e);
  const gen_data = await generateCouplet(query.prompt as string);

  return gen_data;
});
