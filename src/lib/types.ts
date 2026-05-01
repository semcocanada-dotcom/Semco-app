export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string;
}

export interface CartItem {
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
