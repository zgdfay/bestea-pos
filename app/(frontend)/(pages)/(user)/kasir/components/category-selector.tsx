import { Button } from "@/components/ui/button";
import { Category } from "../../../(dashboard)/dashboard/produk/data/mock-data-products";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  // Use category.name as the value to match Dashboard logic
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => onSelectCategory("all")}
          className={cn(
            "rounded-full whitespace-nowrap cursor-pointer",
            selectedCategory === "all"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "hover:bg-green-50 hover:text-green-700 border-green-200 text-green-700",
          )}
        >
          Semua
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? "default" : "outline"}
            onClick={() => onSelectCategory(category.name)}
            className={cn(
              "rounded-full whitespace-nowrap cursor-pointer",
              selectedCategory === category.name
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "hover:bg-green-50 hover:text-green-700 border-green-200 text-green-700",
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
