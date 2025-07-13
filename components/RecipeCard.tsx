import React from 'react';
import type { Recipe } from '../types';
import * as Icons from './icons';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <h3 className="font-fancy text-3xl font-bold text-orange-800">{recipe.recipeName}</h3>
      </div>
      <div className="bg-white p-6 border-t border-amber-200 grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="flex items-center text-lg font-semibold text-slate-700 mb-3">
            <Icons.IngredientsIcon className="w-5 h-5 mr-2 text-slate-500" />
            Ingredients
          </h4>
          <ul className="space-y-2 text-slate-600 list-none p-0 m-0">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i} className="flex items-start">
                 <span className="flex-shrink-0 w-5 h-6 flex items-center justify-start text-orange-500">
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center text-lg font-semibold text-slate-700 mb-3">
            <Icons.InstructionsIcon className="w-5 h-5 mr-2 text-slate-500" />
            Instructions
          </h4>
          <ol className="space-y-3 text-slate-600">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 mr-3 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full grid place-items-center">{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;