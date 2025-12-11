export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent_id?: number;
    children?: Category[];
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    sale_price?: string;
    sku: string;
    stock_quantity: number;
    is_featured: boolean;
    is_active: boolean;
    images: string[];
    image_url?: string;
    category_id: number;
    category?: Category;
    rating?: number;
    reviews_count?: number;
    variants?: {
        name: string;
        type?: 'color' | 'size' | 'other';
        options: string[];
    }[];
    selectedVariants?: Record<string, string>;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'admin';
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}
