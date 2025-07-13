import React, { useState, useCallback, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { generateRecipesFromImage } from './services/geminiService';
import * as storageService from './services/storageService';
import type { Recipe, SavedRecipeSet } from './types';
import ImageUploader from './components/ImageUploader';
import RecipeCard from './components/RecipeCard';
import Spinner from './components/Spinner';
import RecentRecipes from './components/RecentRecipes';
import * as Icons from './components/icons';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggestingMore, setIsSuggestingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

  const [savedRecipeSets, setSavedRecipeSets] = useState<SavedRecipeSet[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const mainContentRef = useRef<HTMLElement>(null);
  const topOfPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError(true);
      setError('API Key is not configured. Please set the API_KEY environment variable.');
    }
    setSavedRecipeSets(storageService.getSavedRecipeSets());
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setRecipes(null);
      setError(null);
      setActiveSessionId(null); // It's a new session
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!image || apiKeyError) return;

    setIsLoading(true);
    setError(null);
    setRecipes(null);

    const base64Data = image.split(',')[1];

    try {
      const result = await generateRecipesFromImage(base64Data);
      if (result.error) {
        setError(result.error);
        setRecipes([]);
      } else if (result.recipes && result.recipes.length > 0) {
        setRecipes(result.recipes);
        const newSet: SavedRecipeSet = {
          id: Date.now().toString(),
          image,
          recipes: result.recipes,
          createdAt: Date.now(),
        };
        setActiveSessionId(newSet.id);
        setSavedRecipeSets(prevSets => {
            const updatedSets = [newSet, ...prevSets];
            storageService.saveRecipeSets(updatedSets);
            return updatedSets;
        });

      } else {
        setError("I couldn't find enough ingredients to suggest a recipe. Please try a clearer photo or a fridge with more items.");
        setRecipes([]);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get recipes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [image, apiKeyError]);

  const handleSuggestMore = async () => {
    if (!image || apiKeyError || !activeSessionId) return;

    setIsSuggestingMore(true);
    setError(null);
    const base64Data = image.split(',')[1];

    try {
      const result = await generateRecipesFromImage(base64Data, recipes || []);
      if (result.error) {
        setError(result.error);
      } else if (result.recipes && result.recipes.length > 0) {
        const newRecipes = result.recipes;
        const updatedFullRecipeList = [...(recipes || []), ...newRecipes];
        setRecipes(updatedFullRecipeList);
        
        setSavedRecipeSets(prevSets => {
            const updatedSets = prevSets.map(s =>
              s.id === activeSessionId ? { ...s, recipes: updatedFullRecipeList } : s
            );
            storageService.saveRecipeSets(updatedSets);
            return updatedSets;
        });

        setTimeout(() => {
          mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      } else {
        setError("I couldn't come up with any more recipes. Looks like we've used all our ideas!");
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get more recipes: ${errorMessage}`);
    } finally {
      setIsSuggestingMore(false);
    }
  };

  const handleSaveRecipes = () => {
    if (!mainContentRef.current) return;
    html2canvas(mainContentRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fef3c7' // amber-100
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'fridge-chef-recipes.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    });
  };

  const handleSelectSavedSet = (set: SavedRecipeSet) => {
    setImage(set.image);
    setRecipes(set.recipes);
    setActiveSessionId(set.id);
    setError(null);
    topOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    storageService.clearSavedRecipeSets();
    setSavedRecipeSets([]);
  };

  return (
    <div ref={topOfPageRef} className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <Icons.ChefHatIcon className="w-12 h-12 text-slate-600" />
            <h1 className="font-fancy text-5xl sm:text-6xl font-bold text-slate-700 tracking-wide">
              Fridge Chef AI
            </h1>
          </div>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            What's for dinner? Upload a photo of your fridge, and I'll whip up some recipe ideas!
          </p>
        </header>

        <main ref={mainContentRef} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div data-html2canvas-ignore="true">
            <ImageUploader onImageUpload={handleImageUpload} imageUrl={image} />
            
            <div className="mt-6 text-center">
              <button
                onClick={handleAnalyzeClick}
                disabled={!image || isLoading || apiKeyError}
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-full shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Icons.SparklesIcon className="w-6 h-6 mr-2" />
                    Suggest Recipes
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            {apiKeyError && (
              <div data-html2canvas-ignore="true" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <div className="flex">
                  <Icons.WarningIcon className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <p className="font-bold">Configuration Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error && !apiKeyError && (
              <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md text-center" role="alert">
                 <p className="font-semibold">{error}</p>
              </div>
            )}

            {recipes && recipes.length > 0 && (
              <div className="space-y-6 pt-6">
                 <h2 className="font-fancy text-center text-4xl font-bold text-slate-700">Your Recipe Suggestions</h2>
                {recipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} />
                ))}
              </div>
            )}

            {!image && !isLoading && !error && (!recipes || recipes.length === 0) && (
              <div data-html2canvas-ignore="true" className="text-center text-slate-500 py-10 px-4 border-2 border-dashed border-sky-200 rounded-lg bg-sky-50/50">
                <Icons.FridgeIcon className="w-16 h-16 mx-auto text-sky-400" />
                <p className="mt-4 text-xl font-semibold">Your culinary adventure awaits!</p>
                <p className="mt-1">Upload a photo of your fridge to get started.</p>
              </div>
            )}
          </div>
          
          {recipes && recipes.length > 0 && !isLoading && (
            <div data-html2canvas-ignore="true" className="mt-8 pt-6 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleSuggestMore}
                disabled={isSuggestingMore || !activeSessionId}
                className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 text-white font-bold text-base rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 ease-in-out disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSuggestingMore ? (
                  <>
                    <Spinner />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Icons.RefreshIcon className="w-5 h-5 mr-2" />
                    Suggest More
                  </>
                )}
              </button>
              <button
                onClick={handleSaveRecipes}
                className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white font-bold text-base rounded-full shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out"
              >
                <Icons.SaveIcon className="w-5 h-5 mr-2" />
                Save Recipes
              </button>
            </div>
          )}
        </main>
        
        <div data-html2canvas-ignore="true">
            <RecentRecipes sets={savedRecipeSets} onSelect={handleSelectSavedSet} onClear={handleClearHistory} />
        </div>

        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by Google Gemini. Recipes are AI-generated; please use your best judgment when cooking.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
