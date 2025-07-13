
export interface Recipe {
  recipeName: string;
  ingredients: string[];
  instructions: string[];
}

export interface ApiResponse {
  recipes: Recipe[];
  error?: string;
}

export interface SavedRecipeSet {
  id: string;
  image: string;
  recipes: Recipe[];
  createdAt: number;
}
