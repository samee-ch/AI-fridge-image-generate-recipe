import type { SavedRecipeSet } from '../types';

const STORAGE_KEY = 'fridgeChefAi-savedRecipes';

export const getSavedRecipeSets = (): SavedRecipeSet[] => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const sets: SavedRecipeSet[] = JSON.parse(savedData);
      // Sort by creation date, newest first
      return sets.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (error) {
    console.error("Failed to load recipes from local storage:", error);
  }
  return [];
};

export const saveRecipeSets = (sets: SavedRecipeSet[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (error) {
    console.error("Failed to save recipes to local storage:", error);
  }
};

export const clearSavedRecipeSets = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear recipes from local storage:", error);
    }
}
