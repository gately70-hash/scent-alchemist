import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { inventory, target } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in Vercel' }, { status: 500 });
    }

    const hasInventory = Array.isArray(inventory) && inventory.length > 0;

    const prompt = `You are a master fragrance alchemist and luxury scent expert.
The user currently owns these bottles in their collection: ${hasInventory ? inventory.join(', ') : 'None'}
The user wants to smell like this target scent: "${target}"

Your task:
1. Analyze the olfactory note profile of "${target}" (top, heart, and base notes).
2. Examine the user's current inventory. Identify 1, 2, or up to 3 bottles they ALREADY own that share key accords (e.g., woody base, citrus opening, warm amber, smoky spice) with the target scent.
3. Identify EXACTLY ONE missing fragrance bottle (designer, niche, or high-tier Middle Eastern clone) they need to acquire to bridge the gap and complete the target scent profile when layered with their existing bottle(s).
4. Write a precise, step-by-step layering protocol ("recipe") explaining exactly how many sprays of their existing bottle(s) (1, 2, or 3 of them) to apply, where to apply them, wait times, and how to layer the new missing bottle on top.

Respond ONLY with a valid raw JSON object matching this exact structure (no markdown, no backticks):
{
  "targetName": "Proper full name of the target fragrance",
  "targetRetail": "Estimated UK retail price in GBP (e.g., £215)",
  "targetMatch": "Estimated closeness percentage (e.g., 94%)",
  "matchingShelfBottle": "Exact name(s) of the 1 to 3 bottles from their inventory used in this mix (e.g., 'Lattafa Khamrah + Bleu de Chanel EdP'). If their inventory is empty or completely incompatible, write 'None'",
  "ownedRole": "What role their existing bottle(s) play in the layer (e.g., 'Provides the warm spiced praline base and fresh citrus lift')",
  "missingPieceName": "Exact name of the single bottle they need to buy",
  "missingRole": "What missing notes this new bottle adds to complete the target profile",
  "missingPrice": "Estimated UK price in GBP (e.g., £35)",
  "recipe": "Exact spray-by-spray layering instructions combining the new bottle with the 1-3 bottles they already own (e.g., 'Apply 2 sprays of your Lattafa Khamrah to the chest as the base, layer 1 spray of your Bleu de Chanel on the neck, wait 30 seconds, then finish with 2 sprays of [Missing Bottle] over both pulse points.')"
}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    };

    // Primary attempt: Use the exact model Google requested in your logs (gemini-3.1-pro-preview)
    let targetModel = 'models/gemini-3.1-pro-preview';
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    // Self-healing fallback: If 3.1-pro-preview is rate-limited or unavailable, query ListModels for your key's active models
    if (!response.ok) {
      const firstError = await response.text();
      console.warn(`Primary model (${targetModel}) failed:`, firstError);

      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();

      if (listData.models && listData.models.length > 0) {
        const supportedModels = listData.models.filter(
          (m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );

        // Prioritize 3.1 Pro, then any Pro model, then Flash
        const bestModel =
          supportedModels.find((m) => m.name.includes('gemini-3.1-pro')) ||
          supportedModels.find((m) => m.name.includes('gemini-3') && m.name.includes('pro')) ||
          supportedModels.find((m) => m.name.includes('gemini-3') && m.name.includes('flash')) ||
          supportedModels.find((m) => m.name.includes('pro')) ||
          supportedModels.find((m) => m.name.includes('flash')) ||
          supportedModels[0];

        if (bestModel) {
          console.log(`Auto-discovered active model for key: ${bestModel.name}`);
          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${bestModel.name}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            }
          );
        }
      }
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("GOOGLE API ERROR:", JSON.stringify(data));
      return NextResponse.json(
        { error: data?.error?.message || 'Google API rejected the request' },
        { status: response.status }
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("Empty candidate returned from Google:", JSON.stringify(data));
      return NextResponse.json({ error: 'AI returned an empty synthesis' }, { status: 500 });
    }

    // Safely extract JSON even if the model wraps it in markdown text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanJsonString = jsonMatch ? jsonMatch[0] : rawText;
    const parsedRecipe = JSON.parse(cleanJsonString);

    return NextResponse.json(parsedRecipe);

  } catch (error) {
    console.error('Scentmix Engine Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to synthesize recipe' },
      { status: 500 }
    );
  }
}
