const http = require("http");

const LlamaProvider = require("./providers/llama-provider");
const TopicAIEngine = require("./engine/topic-ai-engine");

const PORT = 18766;

const server = http.createServer((req, res) => {
  if (
    req.method !== "POST" ||
    req.url !== "/v1/chat/completions"
  ) {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    const request = JSON.parse(body);

    console.log("MODEL:", request.model);
    console.log("AI REQUEST RECEIVED");

    const response = {
      choices: [
        {
          message: {
            role: "assistant",
            content: JSON.stringify({
              topics: [
                {
                  id: "earth-stops-rotating",
                  title: "What If Earth Suddenly Stopped Rotating?",
                  curiosity: 9.8,
                  visual: 9.7,
                  shortForm: 9.6,
                  novelty: 9.2,
                  educational: 9.9
                },
                {
                  id: "moon-disappears",
                  title: "What If the Moon Suddenly Disappeared?",
                  curiosity: 9.7,
                  visual: 9.8,
                  shortForm: 9.5,
                  novelty: 9.1,
                  educational: 9.3
                },
                {
                  id: "gravity-doubles",
                  title: "What If Earth's Gravity Suddenly Doubled?",
                  curiosity: 9.6,
                  visual: 9.5,
                  shortForm: 9.4,
                  novelty: 8.9,
                  educational: 9.7
                }
              ]
            })
          }
        }
      ]
    };

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(response));
  });
});

async function main() {
  await new Promise(resolve => {
    server.listen(PORT, "127.0.0.1", resolve);
  });

  console.log("===== FULL AI TOPIC PIPELINE =====");
  console.log("MOCK LLAMA:", `http://127.0.0.1:${PORT}`);

  const provider = new LlamaProvider({
    baseUrl: `http://127.0.0.1:${PORT}`,
    model: "mock-qwen"
  });

  const engine = new TopicAIEngine({
    provider: provider.generate.bind(provider),
    minIdeas: 3,
    maxIdeas: 10
  });

  const result = await engine.generate(
    "Generate 3 scientific What If topics for YouTube Shorts.",
    {
      model: "mock-qwen"
    }
  );

  console.log();
  console.log("GENERATED:", result.topics.length);
  console.log("ADDED:", result.added);

  console.log();
  console.log("RANKING:");

  for (const topic of result.ranking) {
    console.log(
      `${topic.score.toFixed(2)} -> ${topic.id}`
    );
  }

  console.log();
  console.log("SELECTED:", result.selected.id);
  console.log("TITLE:", result.selected.title);

  await new Promise(resolve => {
    server.close(resolve);
  });

  console.log();
  console.log("FULL AI TOPIC PIPELINE: OK");
}

main().catch(error => {
  console.error("TEST FAILED:", error.message);

  server.close(() => {
    process.exit(1);
  });
});
