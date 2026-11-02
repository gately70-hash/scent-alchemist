import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { inventory, target } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured in Vercel' }, { status: 500 });
    }

    // This is the prompt that programs the AI's behavior
    const prompt = `You are a master fragrance alchemist and luxury scent expert. 
    The user currently owns these bottles: ${inventory.length > 0 ? inventory.join(', ') : 'None'}
    The user wants to smell like this target scent: ${target}
    
    Step 1: Analyze the target's note profile. 
    Step 2: Check if the user's inventory has a bottle that covers the base or top notes of the target. 
    Step 3: Identify EXACTLY ONE missing fragrance (can be a designer or high-quality clone) the user needs to buy to layer with their existing bottle to recreate the target.
    
    Respond ONLY in valid JSON format matching this exact structure:
    {
      "targetName": "The proper name of the target scent",
      "targetRetail": "Estimated retail price in GBP (£)",
      "targetMatch": "Percentage like 94%",
      "matchingShelfBottle": "The exact name of the bottle they already own that fits best (if they own none, write 'None')",
      "ownedRole": "What role their existing bottle plays (e.g., 'Spicy base' or 'Fresh opening')",
      "missingPieceName": "The name of the single bottle they need to buy",
      "missingRole": "What role this new bottle plays in the mix",
      "missingPrice": "Estimated price in GBP (£)",
      "recipe": "A clear, 1-sentence protocol on how to spray them together."
    }`;

    // Send the prompt to Gemini 1.5 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });

    const data = await response.json();
    
    // Extract the JSON text from Gemini's response
    let aiText = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown formatting if Gemini adds it
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(aiText));
    
  } catch (error) {
    console.error('Scentmix Engine Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize recipe' }, { status: 500 });
  }
}
