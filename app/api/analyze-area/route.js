function safeValue(value, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isNaN(value)) return fallback;
  return value;
}

function fallbackDescription(area) {
  const label = safeValue(area.label || area.LABEL, "This area");
  const priority = Number(area.priority_score);

  if (Number.isNaN(priority)) {
    return `${label} has limited available data, so a full AI summary could not be generated.`;
  }

  if (priority >= 0.7) {
    return `${label} appears to be a relatively high-priority area for tree planting based on the available environmental and community indicators.`;
  }

  if (priority >= 0.3) {
    return `${label} shows moderate need for additional tree coverage and may benefit from targeted greening efforts.`;
  }

  return `${label} appears to have relatively lower planting urgency compared with higher-priority areas in the dataset.`;
}

function buildPrompt(area) {
  const label = safeValue(area.label || area.LABEL);

  return `
You are helping a map app explain environmental data for one area.

Write exactly 2 or 3 sentences in simple, clear English.
Be factual, cautious, and concise.
Do not exaggerate.
Do not invent facts.
If data is missing, say that some values are unavailable.
Do not use bullet points.

Area name: ${label}
Population (2020): ${safeValue(area.population_2020 ?? area.Population_2020)}
Poverty rate (2020): ${safeValue(area.poverty_rate_2020 ?? area.Poverty_Rate_2020)}
Heat mean: ${safeValue(area.heat_mean)}
Tree count: ${safeValue(area.tree_count ?? area.tree_count_new)}
Tree density: ${safeValue(area.tree_density)}
People at risk: ${safeValue(area.people_at_risk)}
Tree deficit: ${safeValue(area.tree_deficit)}
Human tree deficit: ${safeValue(area.human_tree_deficit)}
Priority score: ${safeValue(area.priority_score)}

Focus on:
- heat exposure
- tree coverage
- community vulnerability
- whether this area may deserve more tree planting attention
`;
}

async function loadGoogleGenAI() {
  const dynamicImport = new Function("specifier", "return import(specifier)");
  const mod = await dynamicImport("@google/genai");
  return mod.GoogleGenAI;
}

export async function POST(request) {
  try {
    const area = await request.json();

    if (!area || typeof area !== "object") {
      return Response.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    let description = fallbackDescription(area);

    if (process.env.GEMINI_API_KEY) {
      try {
        const GoogleGenAI = await loadGoogleGenAI();
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: buildPrompt(area),
        });

        description = response?.text?.trim() || description;
      } catch (sdkError) {
        console.error("Gemini SDK unavailable, using fallback description:", sdkError);
      }
    }

    return Response.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error("analyze-area error:", error);

    return Response.json(
      {
        success: true,
        description: fallbackDescription({}),
        error: error?.message || "Unknown server error",
      },
      { status: 200 }
    );
  }
}
