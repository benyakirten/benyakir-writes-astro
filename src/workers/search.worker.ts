import data from "../generated/search-data.json";
import { search, type SearchDataset } from "../lib/search/search";

const dataset = data as unknown as SearchDataset;
const worker = globalThis as unknown as {
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<{ query: string }>) => void,
  ) => void;
  postMessage: (value: unknown) => void;
};

worker.addEventListener("message", ({ data: message }) => {
  worker.postMessage(search(message.query, dataset));
});
