export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  image_url: string;
}
