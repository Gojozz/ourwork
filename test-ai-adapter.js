const AIAdapter = require("./engine/ai-adapter");

async function main() {
  console.log("===== AI ADAPTER TEST =====");

  const adapter = new AIAdapter();

  console.log("===== NO PROVIDER =====");

  try {
    await adapter.generate("Generate topics");
    console.log("ERROR: missing provider was accepted");
    process.exit(1);
  } catch (error) {
    console.log("REJECTED:", error.message);
  }

  console.log();
  console.log("===== MOCK PROVIDER =====");

  adapter.setProvider(async (prompt, options) => {
    console.log("PROMPT RECEIVED:", prompt);
    console.log("MODEL:", options.model || "default");

    return JSON.stringify({
      topics: [
        {
          id: "earth-loses-atmosphere",
          title: "What If Earth Suddenly Lost Its Atmosphere?",
          curiosity: 9.7,
          visual: 9.6,
          shortForm: 9.5,
          novelty: 9.0,
          educational: 9.8
        }
      ]
    });
  });

  const output = await adapter.generate(
    "Generate one scientific What If topic",
    {
      model: "mock-model"
    }
  );

  console.log("OUTPUT:", output);

  console.log();
  console.log("===== INVALID PROVIDER =====");

  try {
    adapter.setProvider("not-a-function");
    console.log("ERROR: invalid provider was accepted");
    process.exit(1);
  } catch (error) {
    console.log("REJECTED:", error.message);
  }

  console.log();
  console.log("AI ADAPTER: OK");
}

main().catch(error => {
  console.error("TEST FAILED:", error.message);
  process.exit(1);
});
