export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string;
  brand: string;
  description: string;
  prosUsing: number;
  inStock: boolean;
  image?: string; // URL — drop real photo here; component falls back to placeholder
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Kit {
  id: number;
  name: string;
  description: string;
  items: KitItem[];
  category: string;
}

export interface KitItem {
  product: Product;
  quantity: number;
}

export interface SavedJob {
  id: number;
  name: string;
  address: string;
  itemCount: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
}
