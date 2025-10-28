export interface SaleRecord {
  id: string;
  date: string; // ISO date string
  part: string;
  amount: number;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Part {
  id: string;
  supplierId: string;
  name: string;
  price: number;
}

export interface PaymentRecord {
  id: string;
  supplierId: string;
  amount: number;
  date: string; // ISO date string
}
