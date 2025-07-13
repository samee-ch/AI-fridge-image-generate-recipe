
import { GoogleGenAI, Type } from "@google/genai";
import type { ApiResponse, Recipe } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      description: "An array of 1 or 2 simple recipes.",
      items: {
        type: Type.OBJECT,
        properties: {
          recipeName: {
            type: Type.STRING,
            description: "The name of the recipe."
          },
          ingredients: {
            type: Type.ARRAY,
            description: "List of required ingredients identified from the image.",
            items: {
              type: Type.STRING
            }
          },
          instructions: {
            type: Type.ARRAY,
            description: "Easy step-by-step cooking instructions, maximum 4 steps.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["recipeName", "ingredients", "instructions"]
      }
    },
    error: {
        type: Type.STRING,
        description: "Set to 'I couldn't find enough ingredients to suggest a recipe. Please try a clearer photo.' if no new recipes can be generated. Otherwise, this field should not be present."
    }
  }
};


export const generateRecipesFromImage = async (base64Image: string, existingRecipes: Recipe[] = []): Promise<ApiResponse> => {
  const model = "gemini-2.5-flash";

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image
    }
  };

  const suggestionPrompt = existingRecipes.length > 0
    ? `You have already suggested the following recipes: ${existingRecipes.map(r => r.recipeName).join(', ')}. Please provide 2 new and different recipes.`
    : 'Based *only* on the identified ingredients, suggest 1 or 2 simple recipes.';

  const fullPrompt = [
    'You are a helpful cooking assistant. Your task is to analyze the provided image of the inside of a fridge.',
    '',
    'Follow these steps:',
    '1.  Identify only the visible food ingredients (e.g., eggs, milk, vegetables, sauces, fruits, leftovers).',
    '2.  Ignore all non-food items like containers, packaging, bottles, or background objects.',
    `3.  ${suggestionPrompt}`,
    '4.  Each recipe must include a recipe name, a list of the required ingredients from the image, and easy-to-follow, step-by-step instructions (maximum 4 steps).',
    "5.  If you cannot identify enough ingredients to create at least one sensible new recipe, set the 'error' field in your response.",
    '',
    'Your response must be friendly, concise, and suitable for beginner cooks.'
  ].join('\n');

  const textPart = {
    text: fullPrompt
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });
    
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received an empty response from the API.");
    }

    const parsedJson: ApiResponse = JSON.parse(responseText);
    return parsedJson;

  } catch (error) {
    console.error("Error generating recipes:", error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the API.");
  }
};