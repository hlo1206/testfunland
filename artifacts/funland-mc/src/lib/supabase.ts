import { createClient } from "@supabase/supabase-js";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "funland-supabase-auth",
  },
});

export const ADMIN_EMAIL = "prideisnub@funland.local";

export type Product = {
  id: string;
  category: "coins" | "rank" | "unban";
  name: string;
  priceInr: number;
  tagline: string | null;
  coins: number | null;
  rankTier: string | null;
  unbanDuration: string | null;
  accent: string | null;
  sortOrder: number;
};

export type ServerStatus = {
  status: "online" | "offline" | "maintenance";
  playersOnline: number;
  maxPlayers: number;
  ip: string;
  port: number;
  version: string;
  message: string | null;
};

export type Order = {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  priceInr: number;
  minecraftUsername: string;
  contact: string | null;
  referral: string | null;
  paymentMethod: string;
  paymentProofPath: string | null;
  transactionRef: string | null;
  notes: string | null;
  status: "pending" | "verified" | "delivered" | "rejected";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  category: Product["category"];
  name: string;
  price_inr: number;
  tagline: string | null;
  coins: number | null;
  rank_tier: string | null;
  unban_duration: string | null;
  accent: string | null;
  sort_order: number;
};

type StatusRow = {
  status: ServerStatus["status"];
  players_online: number;
  max_players: number;
  ip: string;
  port: number;
  version: string;
  message: string | null;
};

type OrderRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  price_inr: number;
  minecraft_username: string;
  contact: string | null;
  referral: string | null;
  payment_method: string;
  payment_proof_path: string | null;
  transaction_ref: string | null;
  notes: string | null;
  status: Order["status"];
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  category: r.category,
  name: r.name,
  priceInr: r.price_inr,
  tagline: r.tagline,
  coins: r.coins,
  rankTier: r.rank_tier,
  unbanDuration: r.unban_duration,
  accent: r.accent,
  sortOrder: r.sort_order,
});

const mapStatus = (r: StatusRow): ServerStatus => ({
  status: r.status,
  playersOnline: r.players_online,
  maxPlayers: r.max_players,
  ip: r.ip,
  port: r.port,
  version: r.version,
  message: r.message,
});

const mapOrder = (r: OrderRow): Order => ({
  id: r.id,
  productId: r.product_id,
  productName: r.product_name,
  productCategory: r.product_category,
  priceInr: r.price_inr,
  minecraftUsername: r.minecraft_username,
  contact: r.contact,
  referral: r.referral,
  paymentMethod: r.payment_method,
  paymentProofPath: r.payment_proof_path,
  transactionRef: r.transaction_ref,
  notes: r.notes,
  status: r.status,
  adminNote: r.admin_note,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function useListProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ProductRow[]).map(mapProduct);
    },
  });
}

export function useGetServerStatus(opts?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["server-status"],
    refetchInterval: opts?.refetchInterval,
    queryFn: async (): Promise<ServerStatus> => {
      const { data, error } = await supabase
        .from("server_status")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return mapStatus(data as StatusRow);
    },
  });
}

export function useUpdateServerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      status: ServerStatus["status"];
      playersOnline: number;
      maxPlayers: number;
      ip: string;
      port: number;
      version: string;
      message: string | null;
    }): Promise<ServerStatus> => {
      const { data, error } = await supabase
        .from("server_status")
        .update({
          status: input.status,
          players_online: input.playersOnline,
          max_players: input.maxPlayers,
          ip: input.ip,
          port: input.port,
          version: input.version,
          message: input.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("*")
        .single();
      if (error) throw error;
      return mapStatus(data as StatusRow);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["server-status"] });
    },
  });
}

export type CreateOrderInput = {
  productId: string;
  minecraftUsername: string;
  contact: string | null;
  referral: string | null;
  paymentMethod: string;
  paymentProofPath: string | null;
  transactionRef: string | null;
  notes: string | null;
};

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<Order> => {
      const { data: prod, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", input.productId)
        .single();
      if (prodErr) throw prodErr;
      const product = mapProduct(prod as ProductRow);

      const { data, error } = await supabase
        .from("orders")
        .insert({
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          price_inr: product.priceInr,
          minecraft_username: input.minecraftUsername,
          contact: input.contact,
          referral: input.referral,
          payment_method: input.paymentMethod,
          payment_proof_path: input.paymentProofPath,
          transaction_ref: input.transactionRef,
          notes: input.notes,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      return mapOrder(data as OrderRow);
    },
  });
}

export function useListAdminOrders(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-orders"],
    enabled: opts?.enabled ?? true,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as OrderRow[]).map(mapOrder);
    },
  });
}

export function useUpdateAdminOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      orderId: string;
      data: { status: Order["status"]; adminNote: string | null };
    }): Promise<Order> => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: input.data.status,
          admin_note: input.data.adminNote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.orderId)
        .select("*")
        .single();
      if (error) throw error;
      return mapOrder(data as OrderRow);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}

export function useAdminStats(orders: Order[] | undefined) {
  const list = orders ?? [];
  return {
    pending: list.filter((o) => o.status === "pending").length,
    verified: list.filter((o) => o.status === "verified").length,
    delivered: list.filter((o) => o.status === "delivered").length,
    rejected: list.filter((o) => o.status === "rejected").length,
    revenueInr: list
      .filter((o) => o.status === "verified" || o.status === "delivered")
      .reduce((s, o) => s + o.priceInr, 0),
  };
}

export type UploadResult = { publicUrl: string };

export async function uploadPaymentProof(file: File): Promise<UploadResult> {
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(filename, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from("payment-proofs")
    .getPublicUrl(filename);
  return { publicUrl: data.publicUrl };
}
