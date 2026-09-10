class Strategist {
  constructor(options = {}) {
    this.maxUsedTopics = options.maxUsedTopics || 20;
    this.defaultIdeas = options.defaultIdeas || 5;
  }

  buildPrompt(context = {}) {
    const ideas = context.ideas || this.defaultIdeas;
    const usedTopics = Array.isArray(context.usedTopics)
      ? context.usedTopics
      : [];

    const usedText = usedTopics.length
      ? usedTopics
          .slice(-this.maxUsedTopics)
          .map((topic, index) => {
            if (typeof topic === "string") {
              return `${index + 1}. ${topic}`;
            }

            return `${index + 1}. ${
              topic.title || topic.id || "Unknown topic"
            }`;
          })
          .join("\n")
      : "None";

    return `
You are the AI Strategist for WHAT IF LAB.

Generate ${ideas} original scientific "What If" topics
for YouTube Shorts.

OBJECTIVES:
- Strong curiosity
- Strong visual potential
- Suitable for 30–60 second videos
- Scientifically meaningful
- Educational
- Novel
- Clear cause-and-effect consequences
- Easy to visualize as a 3D simulation
- Avoid topics already used

SCORING:
curiosity: numeric score from 0 to 10
visual: numeric score from 0 to 10
shortForm: numeric score from 0 to 10
novelty: numeric score from 0 to 10
educational: numeric score from 0 to 10

IMPORTANT:
- All five scoring fields MUST be numbers, not strings.
- Do not put explanations inside scoring fields.

PREVIOUSLY USED TOPICS:
${usedText}

OUTPUT RULES:
- Return JSON only.
- Return an object with a "topics" array.
- Each topic must contain:
  id
  title
  curiosity
  visual
  shortForm
  novelty
  educational
- curiosity, visual, shortForm, novelty, and educational MUST be numeric values from 0 to 10.
- The topic must describe a specific hypothetical scientific scenario, not a generic question.
- Prefer extreme, surprising, visual cause-and-effect scenarios.
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = Strategist;
}
