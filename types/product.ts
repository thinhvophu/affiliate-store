export interface Product {
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  affiliateUrl: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  publishedAt: string;
  featured: boolean;
}
