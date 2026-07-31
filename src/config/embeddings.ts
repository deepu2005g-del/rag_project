import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { config } from "./env";

export const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: config.huggingFaceApiKey,
  model: "BAAI/bge-base-en-v1.5",
});
