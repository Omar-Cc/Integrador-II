import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  stock: number;
  status: "ok" | "low" | "out";
  minStock?: number;
  suggestedSupplier?: string;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  items: string;
  total: number;
  status: "pendiente" | "completado" | "procesando" | "cancelado";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "activo" | "suspendido";
  joinedDate: string;
  lastActive: string;
}

export interface ReplenishmentRequest {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  minStock: number;
  requestedQty: number;
  supplier: string;
  requestedBy: string;
  reason: string;
  status: "Pendiente de aprobación" | "Aprobado" | "Rechazado" | "Recibido";
  rejectionReason?: string;
}

interface ERPState {
  products: Product[];
  orders: Order[];
  users: User[];
  replenishments: ReplenishmentRequest[];
  
  // Modal state for replenishment
  replenishmentModal: {
    isOpen: boolean;
    product: Product | null;
  };
  openReplenishmentModal: (product: Product) => void;
  closeReplenishmentModal: () => void;

  // Product actions
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Order actions
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;

  // User actions
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  suspendUser: (id: string) => void;
  deleteUser: (id: string) => void;

  // Replenishment actions
  addReplenishment: (request: Omit<ReplenishmentRequest, "id" | "status">) => void;
  approveReplenishment: (id: string) => void;
  rejectReplenishment: (id: string, reason: string) => void;
  receiveReplenishment: (id: string) => void;
  deleteReplenishment: (id: string) => void;
  updateReplenishment: (request: ReplenishmentRequest) => void;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Soldadora Inverter Arc 200", code: "SLD-200", category: "Equipos", price: 799.99, stock: 15, status: "ok", minStock: 10, suggestedSupplier: "Marweld Corp" },
  { id: "2", name: "Careta de Soldar Fotosensible", code: "CRT-FOTO", category: "Seguridad", price: 149.90, stock: 4, status: "low", minStock: 8, suggestedSupplier: "Arc & Safety S.A." },
  { id: "3", name: "Electrodos Cellocord E6011 1/8", code: "ELC-6011", category: "Consumibles", price: 45.00, stock: 120, status: "ok", minStock: 50, suggestedSupplier: "Metalúrgica Andina" },
  { id: "4", name: "Guantes de Cuero Caña Larga", code: "GNT-CR", category: "Seguridad", price: 29.90, stock: 0, status: "out", minStock: 15, suggestedSupplier: "Arc & Safety S.A." },
  { id: "5", name: "Cortadora de Plasma Cut 50", code: "PLS-50", category: "Equipos", price: 1299.00, stock: 8, status: "ok", minStock: 5, suggestedSupplier: "Marweld Corp" },
  { id: "6", name: "Antorcha TIG WP-26 4m", code: "ANT-TIG", category: "Accesorios", price: 189.50, stock: 3, status: "low", minStock: 6, suggestedSupplier: "TecnoSoldaduras" },
];

const INITIAL_ORDERS: Order[] = [
  { id: "PED-8201", customer: "Carlos Mendoza", date: "2026-06-16", items: "1x Soldadora Inverter Arc 200", total: 799.99, status: "pendiente" },
  { id: "PED-8202", customer: "Marta Rodríguez", date: "2026-06-15", items: "2x Careta de Soldar Fotosensible", total: 299.80, status: "completado" },
  { id: "PED-8203", customer: "Constructora H&M S.A.", date: "2026-06-15", items: "10x Electrodos Cellocord E6011", total: 450.00, status: "completado" },
  { id: "PED-8204", customer: "Jorge Valdivia", date: "2026-06-14", items: "1x Cortadora de Plasma Cut 50", total: 1299.00, status: "pendiente" },
  { id: "PED-8205", customer: "Roberto Soto", date: "2026-06-13", items: "1x Antorcha TIG WP-26 4m", total: 189.50, status: "cancelado" },
  { id: "PED-8206", customer: "Lucía Fernández", date: "2026-06-12", items: "3x Careta de Soldar Fotosensible", total: 449.70, status: "completado" },
  { id: "PED-8207", customer: "Miguel Ángel", date: "2026-06-11", items: "1x Antorcha TIG WP-26 4m", total: 189.50, status: "procesando" },
];

const INITIAL_USERS: User[] = [
  { id: "1", name: "Jennifer Reyes", email: "jennifer.reyes@marweld.pe", role: "Administrador de Sistemas", status: "activo", joinedDate: "2026-01-10", lastActive: "2026-06-17 01:10" },
  { id: "2", name: "Omar Ccora", email: "omar.ccora@marweld.pe", role: "Super Admin / Desarrollador", status: "activo", joinedDate: "2026-01-15", lastActive: "2026-06-17 01:05" },
  { id: "3", name: "Carlos Mendoza", email: "carlos.mendoza@gmail.com", role: "Cliente Premium", status: "activo", joinedDate: "2026-02-20", lastActive: "2026-06-16 18:45" },
  { id: "4", name: "Raúl Castro", email: "raul.castro@marweld.pe", role: "Vendedor / Almacenero", status: "activo", joinedDate: "2026-03-05", lastActive: "2026-06-17 00:30" },
  { id: "5", name: "Ana Pardo", email: "ana.pardo@marweld.pe", role: "Soporte Técnico", status: "suspendido", joinedDate: "2026-04-12", lastActive: "2026-06-10 14:20" },
  { id: "6", name: "Marta Rodríguez", email: "marta.rodriguez@outlook.com", role: "Cliente Registrado", status: "activo", joinedDate: "2026-05-18", lastActive: "2026-06-16 22:15" },
];

const INITIAL_REPLENISHMENTS: ReplenishmentRequest[] = [
  {
    id: "REP-001",
    date: "2026-06-15",
    productId: "2",
    productName: "Careta de Soldar Fotosensible",
    productCode: "CRT-FOTO",
    currentStock: 4,
    minStock: 8,
    requestedQty: 10,
    supplier: "Arc & Safety S.A.",
    requestedBy: "Omar Ccora",
    reason: "Se vendieron varias unidades por el Cyber de soldadura y el stock quedó crítico.",
    status: "Pendiente de aprobación",
  },
  {
    id: "REP-002",
    date: "2026-06-12",
    productId: "4",
    productName: "Guantes de Cuero Caña Larga",
    productCode: "GNT-CR",
    currentStock: 0,
    minStock: 15,
    requestedQty: 25,
    supplier: "Arc & Safety S.A.",
    requestedBy: "Jennifer Reyes",
    reason: "Stock completamente agotado en tienda central.",
    status: "Aprobado",
  },
  {
    id: "REP-003",
    date: "2026-06-10",
    productId: "6",
    productName: "Antorcha TIG WP-26 4m",
    productCode: "ANT-TIG",
    currentStock: 3,
    minStock: 6,
    requestedQty: 5,
    supplier: "TecnoSoldaduras",
    requestedBy: "Raúl Castro",
    reason: "Pocas unidades en stock bajo para atender pedidos pendientes.",
    status: "Recibido",
  },
];

export const useERPStore = create<ERPState>()((set) => ({
  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  users: INITIAL_USERS,
  replenishments: INITIAL_REPLENISHMENTS,
  replenishmentModal: {
    isOpen: false,
    product: null,
  },

  openReplenishmentModal: (product) => set({
    replenishmentModal: { isOpen: true, product }
  }),

  closeReplenishmentModal: () => set({
    replenishmentModal: { isOpen: false, product: null }
  }),

  // Product Actions
  addProduct: (product) => set((state) => {
    const newProduct: Product = {
      ...product,
      id: String(state.products.length + 1)
    };
    return { products: [...state.products, newProduct] };
  }),

  updateProduct: (product) => set((state) => {
    // recalculate status
    let newStatus: "ok" | "low" | "out" = "ok";
    const minVal = product.minStock ?? 5;
    if (product.stock === 0) newStatus = "out";
    else if (product.stock <= minVal) newStatus = "low";

    return {
      products: state.products.map((p) =>
        p.id === product.id ? { ...product, status: newStatus } : p
      )
    };
  }),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),

  // Order Actions
  addOrder: (order) => set((state) => {
    const newOrder: Order = {
      ...order,
      id: `PED-${String(state.orders.length + 8201)}`
    };
    return { orders: [newOrder, ...state.orders] };
  }),

  updateOrder: (order) => set((state) => ({
    orders: state.orders.map((o) => (o.id === order.id ? order : o))
  })),

  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id)
  })),

  // User Actions
  addUser: (user) => set((state) => {
    const newUser: User = {
      ...user,
      id: String(state.users.length + 1)
    };
    return { users: [...state.users, newUser] };
  }),

  updateUser: (user) => set((state) => ({
    users: state.users.map((u) => (u.id === user.id ? user : u))
  })),

  suspendUser: (id) => set((state) => ({
    users: state.users.map((u) =>
      u.id === id ? { ...u, status: "suspendido" as const } : u
    )
  })),

  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id)
  })),

  // Replenishment Actions
  addReplenishment: (request) => set((state) => {
    const newRequest: ReplenishmentRequest = {
      ...request,
      id: `REP-${String(state.replenishments.length + 1).padStart(3, "0")}`,
      status: "Pendiente de aprobación" as const
    };
    return {
      replenishments: [newRequest, ...state.replenishments]
    };
  }),

  approveReplenishment: (id) => set((state) => ({
    replenishments: state.replenishments.map((rep) =>
      rep.id === id ? { ...rep, status: "Aprobado" as const } : rep
    )
  })),

  rejectReplenishment: (id, reason) => set((state) => ({
    replenishments: state.replenishments.map((rep) =>
      rep.id === id ? { ...rep, status: "Rechazado" as const, rejectionReason: reason } : rep
    )
  })),

  receiveReplenishment: (id) => set((state) => {
    let targetProductId = "";
    let quantityToIncrease = 0;

    const updatedReplenishments = state.replenishments.map((rep) => {
      if (rep.id === id) {
        targetProductId = rep.productId;
        quantityToIncrease = rep.requestedQty;
        return { ...rep, status: "Recibido" as const };
      }
      return rep;
    });

    const updatedProducts = state.products.map((prod) => {
      if (prod.id === targetProductId) {
        const newStock = prod.stock + quantityToIncrease;
        let newStatus: "ok" | "low" | "out" = "ok";
        const minVal = prod.minStock ?? 5;
        if (newStock === 0) newStatus = "out";
        else if (newStock <= minVal) newStatus = "low";
        
        return {
          ...prod,
          stock: newStock,
          status: newStatus
        };
      }
      return prod;
    });

    return {
      replenishments: updatedReplenishments,
      products: updatedProducts
    };
  }),

  deleteReplenishment: (id) => set((state) => ({
    replenishments: state.replenishments.filter((r) => r.id !== id)
  })),

  updateReplenishment: (request) => set((state) => ({
    replenishments: state.replenishments.map((r) => r.id === request.id ? request : r)
  })),
}));
