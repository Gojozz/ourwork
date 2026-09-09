const http = require("http");

const Strategist = require("./engine/strategist");
const LlamaProvider = require("./providers/llama-provider");
const TopicAIEngine = require("./engine/topic-ai-engine");

const PORT = 18767;

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
    try {
      const request = JSON.parse(body);

      console.log();
      console.log("===== MOCK AI RECEIVED =====");
      console.log("MODEL:", request.model);

      const prompt = request.messages[0].content;

      console.log(
        "PROMPT HAS USED TOPICS:",
        prompt.includes("Previously used topics") ||
        prompt.includes("PREVIOUSLY USED TOPICS")
      );

      const response = {
        choices: [
          {
            message: {
              role: "assistant",
              content: JSON.stringify({
                topics: [
                  {
                    id: "ocean-disappears",
                    title: "What If All Earth's Oceans Suddenly Disappeared?",
                    curiosity: 9.9,
                    visual: 9.9,
                    shortForm: 9.7,
                    novelty: 9.6,
                    educational: 9.5
                  },
                  {
                    id: "earth-loses-sunlight",
                    title: "What If Sunlight Suddenly Stopped Reaching Earth?",
                    curiosity: 9.8,
                    visual: 9.7,
                    shortForm: 9.5,
                    novelty: 9.4,
                    educational: 9.6
                  },
                  {
                    id: "earth-atmosphere-doubles",
                    title: "What If Earth's Atmosphere Suddenly Doubled?",
                    curiosity: 9.5,
                    visual: 9.3,
                    shortForm: 9.4,
                    novelty: 9.2,
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

    } catch (error) {
      res.writeHead(400, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: error.message
      }));
    }
  });
});

async function main() {
  await new Promise(resolve => {
    server.listen(PORT, "127.0.0.1", resolve);
  });

  console.log("===== STRATEGIST → AI TEST =====");

  const strategist = new Strategist({
    defaultIdeas: 3
  });

  const prompt = strategist.buildPrompt({
    ideas: 3,
    usedTopics: [
      {
        id: "earth-stops-rotating",
        title: "What If Earth Suddenly Stopped Rotating?"
      },
      {
        id: "moon-disappears",
        title: "What If the Moon Suddenly Disappeared?"
      },
      {
        id: "gravity-doubles",
        title: "What If Earth's Gravity Suddenly Doubled?"
      }
    ]
  });

  console.log("STRATEGIST PROMPT CREATED");
  console.log("PROMPT LENGTH:", prompt.length);

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
    prompt,
    {
      model: "mock-qwen"
    }
  );

  console.log();
  console.log("===== RESULT =====");

  console.log("GENERATED:", result.generated.length);
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
  console.log("STRATEGIST AI: OK");
}

main().catch(error => {
  console.error("TEST FAILED:", error.message);

  server.close(() => {
    process.exit(1);
  });
});
