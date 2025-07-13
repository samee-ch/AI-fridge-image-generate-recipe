import React from 'react';
import type { SavedRecipeSet } from '../types';
import * as Icons from './icons';

interface RecentRecipesProps {
  sets: SavedRecipeSet[];
  onSelect: (set: SavedRecipeSet) => void;
  onClear: () => void;
}

const RecentRecipes: React.FC<RecentRecipesProps> = ({ sets, onSelect, onClear }) => {
  if (sets.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-fancy text-3xl sm:text-4xl font-bold text-slate-700">
          Recent Recipes
        </h2>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          aria-label="Clear recent recipes"
        >
          <Icons.TrashIcon className="w-4 h-4" />
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sets.map((set) => (
          <div
            key={set.id}
            onClick={() => onSelect(set)}
            className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
            role="button"
            tabIndex={0}
            aria-label={`View recipes from ${new Date(set.createdAt).toLocaleString()}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(set)}
          >
            <img src={set.image} alt="Fridge contents for a saved recipe set" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center p-2">
               <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {set.recipes.length} {set.recipes.length === 1 ? 'recipe' : 'recipes'}
              </div>
              <p className="text-white font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
                View Recipes
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentRecipes;
