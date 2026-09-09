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
curiosity: 0-10
visual: 0-10
shortForm: 0-10
novelty: 0-10
educational: 0-10

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
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = Strategist;
}
