export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: { url: string; publicId: string }[];
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

export interface Conversation {
  _id: string;
  participants: { _id: string; email: string; role: string }[];
  property: {
    _id: string;
    title: string;
    location: string;
    price: number;
    images?: { url: string; publicId: string }[];
  };
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: { _id: string; email: string; role: string };
  content: string;
  read: boolean;
  createdAt: string;
}
