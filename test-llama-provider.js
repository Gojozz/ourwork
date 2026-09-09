const http = require("http");
const LlamaProvider = require("./providers/llama-provider");

const PORT = 18765;

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

      console.log("MODEL RECEIVED:", request.model);
      console.log(
        "PROMPT RECEIVED:",
        request.messages[0].content
      );

      const response = {
        choices: [
          {
            message: {
              role: "assistant",
              content: JSON.stringify({
                topics: [
                  {
                    id: "earth-loses-magnetic-field",
                    title: "What If Earth's Magnetic Field Suddenly Disappeared?",
                    curiosity: 9.7,
                    visual: 9.5,
                    shortForm: 9.4,
                    novelty: 9.1,
                    educational: 9.8
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

      res.end(
        JSON.stringify({
          error: error.message
        })
      );
    }
  });
});

async function main() {
  await new Promise(resolve => {
    server.listen(PORT, "127.0.0.1", resolve);
  });

  console.log("===== LLAMA PROVIDER TEST =====");
  console.log("MOCK SERVER:", `http://127.0.0.1:${PORT}`);

  const provider = new LlamaProvider({
    baseUrl: `http://127.0.0.1:${PORT}`,
    model: "mock-qwen"
  });

  const output = await provider.generate(
    "Generate one scientific What If topic",
    {
      model: "mock-qwen"
    }
  );

  console.log("OUTPUT:", output);

  if (!output.includes("earth-loses-magnetic-field")) {
    throw new Error("Unexpected provider output");
  }

  await new Promise(resolve => server.close(resolve));

  console.log();
  console.log("LLAMA PROVIDER: OK");
}

main().catch(async error => {
  console.error("TEST FAILED:", error.message);

  try {
    await new Promise(resolve => server.close(resolve));
  } catch (_) {}

  process.exit(1);
});
