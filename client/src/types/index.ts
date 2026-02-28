export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type?: "rent" | "sale";
  status: "pending" | "approved" | "rejected";
  user: {
    _id: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
