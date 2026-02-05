export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  images?: string[];
  category?: string;
  condition?: string;
  currency?: string;
  is_ghost_drop?: boolean;
  ghost_lat?: string;
  ghost_lng?: string;
  ghost_radius?: string;
  ghost_clue?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  image_url: string;
}
