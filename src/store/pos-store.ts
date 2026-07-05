import { create } from "zustand";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  isManual?: boolean;
};

interface PosState {
  cart: CartItem[];
  addItem: (product: { id: string; name: string; salePrice: number; isManual?: boolean }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  addItem: (product) => {
    const { cart } = get();
    // Do not group manual items if they have different IDs, but we can just use the unique ID.
    const existing = cart.find((item) => item.productId === product.id && !item.isManual);
    
    if (existing && !product.isManual) {
      set({
        cart: cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            productId: product.id,
            name: product.name,
            price: product.salePrice,
            quantity: 1,
            isManual: product.isManual,
          },
        ],
      });
    }
  },
  removeItem: (productId) => {
    set({
      cart: get().cart.filter((item) => item.productId !== productId),
    });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  },
  clearCart: () => set({ cart: [] }),
}));
