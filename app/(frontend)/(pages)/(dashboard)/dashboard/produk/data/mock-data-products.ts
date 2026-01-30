export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string; // Category Name
  price: number;
  trackStock: boolean;
  stock: number;
  image: string;
  status: "active" | "inactive";
  variants?: ProductVariant[];
}

export const initialCategories: Category[] = [
  { id: "cat_1", name: "Tea Series", description: "Varian teh original dan rasa buah", productCount: 5 },
  { id: "cat_2", name: "Milk Tea", description: "Paduan teh dan susu creamy", productCount: 4 },
  { id: "cat_3", name: "Topping", description: "Tambahan topping", productCount: 0 }, // Virtual category
];

export const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Original Jasmine Tea",
    category: "Tea Series",
    price: 10000,
    trackStock: false,
    stock: 0,
    image: "/placeholder-tea.jpg",
    status: "active",
    variants: [
        { name: "Medium", price: 10000 },
        { name: "Large", price: 12000 }
    ]
  },
  {
    id: "prod_2",
    name: "Brown Sugar Boba Milk Tea",
    category: "Milk Tea",
    price: 18000,
    trackStock: true,
    stock: 25,
    image: "/placeholder-boba.jpg",
    status: "active",
    variants: [
        { name: "Medium", price: 18000 },
        { name: "Large", price: 22000 }
    ]
  },
];
