import { SectionCard } from "@/components/SectionCard";
import { type MealPlan } from "@/lib/dashboardTypes";

export function MealsToday(props: { meals: MealPlan }) {
  return (
    <SectionCard title="Today’s Meals">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 border-black bg-yellow-100 p-4">
          <div className="mb-2 text-xl font-extrabold">Breakfast</div>
          <div className="text-xl">{props.meals.breakfast}</div>
        </div>
        <div className="rounded-xl border-2 border-black bg-green-100 p-4">
          <div className="mb-2 text-xl font-extrabold">Lunch</div>
          <div className="text-xl">{props.meals.lunch}</div>
        </div>
        <div className="rounded-xl border-2 border-black bg-blue-100 p-4">
          <div className="mb-2 text-xl font-extrabold">Dinner</div>
          <div className="text-xl">{props.meals.dinner}</div>
        </div>
      </div>
    </SectionCard>
  );
}

