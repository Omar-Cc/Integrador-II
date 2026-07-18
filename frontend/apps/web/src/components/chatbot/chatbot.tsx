"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@marweld/ui/lib/utils";
import { useCarritoStore } from "../../features/carrito/stores/carrito.store";
import type { Producto } from "../../features/home/types/producto.types";
import { useAuthStore } from "../../shared/stores/auth.store";
import { apiRequest } from "../../shared/api/client";
import { getProductoById } from "../../features/home/services/productos.service";

type Message = {
  id: string;
  sender: "bot" | "user";
  text?: string;
  products?: Producto[];
  cartItems?: CartMessageItem[];
  showOptionsAfterAdd?: boolean;
};

type CartSummaryItem = {
  productPublicId?: string | null;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

type CartMessageItem = CartSummaryItem & {
  product?: Producto | null;
  imagen?: string;
};

type ChatbotMessageResult = {
  botMessageContent?: string;
  intent?: string;
  toolCallName?: string | null;
  toolCallArgsJson?: string | Record<string, unknown> | null;
  matchedProductPublicIds?: string[];
  cartItems?: CartSummaryItem[];
};

function compactMessageForVisuals(text: string, hasVisuals: boolean): string {
  if (!hasVisuals) return text;

  return text
    .split("\n")
    .filter((line) => !/^\s*[*-]\s+\*\*/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function MarkdownMessage({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => {
        if (!line.trim()) return <div key={`space-${lineIndex}`} className="h-2" />;

        const isBullet = /^\s*[*-]\s+/.test(line);
        const content = line.replace(/^\s*[*-]\s+/, "");
        const fragments = content.split("**");

        return (
          <p key={`line-${lineIndex}`} className={cn("min-h-5", isBullet && "flex gap-2")}>
            {isBullet && <span className="text-primary mt-0.5 font-black">•</span>}
            <span>
              {fragments.map((fragment, fragmentIndex) =>
                fragmentIndex % 2 === 1 ? (
                  <strong key={`${lineIndex}-${fragmentIndex}`} className="font-extrabold text-white">
                    {fragment}
                  </strong>
                ) : (
                  fragment
                ),
              )}
            </span>
          </p>
        );
      })}
    </>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const QUICK_CHIPS = [
  "Electrodos",
  "Máquina de soldar",
  "Máscara de soldar",
  "Guantes de seguridad",
  "Taladro",
  "Pinturas",
  "Cables eléctricos",
  "Ofertas",
  "Productos disponibles",
  "Envío o recojo",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function Chatbot() {
  const router = useRouter();
  const agregarAlCarrito = useCarritoStore((s) => s.agregar);
  const user = useAuthStore((s) => s.user);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hola, soy tu asistente virtual Marweld. ¿Qué producto estás buscando hoy?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat state from sessionStorage on mount to preserve conversation
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem("marweld_chat_messages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      const savedOpen = sessionStorage.getItem("marweld_chat_open");
      if (savedOpen) {
        setIsOpen(JSON.parse(savedOpen));
      }
      const savedSessionId = sessionStorage.getItem("marweld_chat_session_id");
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
    } catch (e) {
      console.error("Error loading chat state from sessionStorage", e);
    }
  }, []);

  // Save chat state to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem("marweld_chat_messages", JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving messages to sessionStorage", e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem("marweld_chat_open", JSON.stringify(isOpen));
    } catch (e) {
      console.error("Error saving chat visibility to sessionStorage", e);
    }
  }, [isOpen]);

  // Initialize session when chatbot is opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChatSession();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (sessionId) {
      void hydrateEmptyCartFromBackend(sessionId);
    }
  }, [sessionId]);

  // Scroll to bottom when messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const initializeChatSession = async () => {
    try {
      const visitorToken = sessionStorage.getItem("marweld_visitor_token") || 
        `visitor-${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem("marweld_visitor_token", visitorToken);

      const response = await apiRequest<{ sessionPublicId: string }>(
        "/api/v1/chatbot/sessions",
        {
          method: "POST",
          body: JSON.stringify({
            tipoActor: user ? "CLIENTE" : "VISITANTE",
            clientPublicId: user?.clientPublicId || null,
            tokenVisitante: user ? null : visitorToken
          })
        }
      );

      if (response && response.sessionPublicId) {
        setSessionId(response.sessionPublicId);
        sessionStorage.setItem("marweld_chat_session_id", response.sessionPublicId);
      }
    } catch (error) {
      console.error("Failed to initialize chatbot session", error);
    }
  };

  const fetchMatchedProducts = async (productIds?: string[]): Promise<Producto[]> => {
    if (!productIds?.length) return [];

    const products = await Promise.all(
      [...new Set(productIds)].slice(0, 4).map((productId) => getProductoById(productId)),
    );
    return products.filter((product): product is Producto => product !== null);
  };

  const fetchCartItems = async (cartItems?: CartSummaryItem[]): Promise<CartMessageItem[]> => {
    if (!cartItems?.length) return [];

    return Promise.all(
      cartItems.map(async (item) => ({
        ...item,
        product: item.productPublicId ? await getProductoById(item.productPublicId) : null,
      })),
    );
  };

  async function hydrateEmptyCartFromBackend(activeSessionId: string) {
    // La web puede haber sido recargada; solo recuperamos el servidor cuando el
    // carrito local aún está vacío para no sobrescribir cambios no sincronizados.
    if (useCarritoStore.getState().items.length > 0) return;

    try {
      const serverItems = await apiRequest<CartSummaryItem[]>(
        `/api/v1/chatbot/sessions/${activeSessionId}/cart/items`,
      );
      if (!serverItems?.length || useCarritoStore.getState().items.length > 0) return;

      const items = await Promise.all(
        serverItems.map(async (item) => {
          const product = item.productPublicId ? await getProductoById(item.productPublicId) : null;
          return {
            id: item.productPublicId || item.nombre,
            nombre: item.nombre,
            imagen: product?.imagen || "/placeholder-product.png",
            precio: item.precioUnitario,
            stock: product?.stock ?? item.cantidad,
            cantidad: item.cantidad,
          };
        }),
      );
      useCarritoStore.getState().establecerItems(items);
    } catch (error) {
      console.error("No se pudo sincronizar el carrito desde el backend", error);
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    submitMessage(userText);
  };

  const handleChipClick = (chip: string) => {
    submitMessage(chip);
  };

  const submitMessage = async (userDisplayText: string) => {
    // Add user message to state
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user" as const, text: userDisplayText },
    ]);
    setIsTyping(true);

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const visitorToken = sessionStorage.getItem("marweld_visitor_token") || 
          `visitor-${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem("marweld_visitor_token", visitorToken);

        const response = await apiRequest<{ sessionPublicId: string }>(
          "/api/v1/chatbot/sessions",
          {
            method: "POST",
            body: JSON.stringify({
              tipoActor: user ? "CLIENTE" : "VISITANTE",
              clientPublicId: user?.clientPublicId || null,
              tokenVisitante: user ? null : visitorToken
            })
          }
        );
        if (response && response.sessionPublicId) {
          activeSessionId = response.sessionPublicId;
          setSessionId(activeSessionId);
          sessionStorage.setItem("marweld_chat_session_id", activeSessionId);
        }
      } catch (err) {
        console.error("Error initializing session before message", err);
      }
    }

    if (!activeSessionId) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Lo siento, no pude conectar con el asistente de chat en este momento.",
        },
      ]);
      return;
    }

    try {
      const response = await fetch(`/api/v1/chatbot/sessions/${activeSessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: userDisplayText }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const body = await response.json();
      const data = body.data as ChatbotMessageResult;
      const matchedProducts = await fetchMatchedProducts(data.matchedProductPublicIds);
      const cartItems = await fetchCartItems(data.cartItems);
      const botText = compactMessageForVisuals(
        data.botMessageContent || "",
        matchedProducts.length > 0 || cartItems.length > 0,
      );

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: botText,
          products: matchedProducts,
          cartItems,
        },
      ]);
      setIsTyping(false);

      const toolCallName = data.toolCallName?.toLowerCase();
      const isCartAction = data.intent === "MODIFICAR_CARRITO" && Boolean(toolCallName);

      if (isCartAction && toolCallName) {
        let args: any = {};
        try {
          args = typeof data.toolCallArgsJson === "string" ? JSON.parse(data.toolCallArgsJson) : data.toolCallArgsJson;
        } catch (e) {
          console.error("Error parsing toolCallArgsJson", e);
        }

        if (toolCallName === "add_to_cart" && args.productPublicId) {
          try {
            const prodRes = await fetch(`/api/v1/products/${args.productPublicId}`);
            if (prodRes.ok) {
              const prodData = await prodRes.json();
              if (prodData && prodData.data) {
                const prod = prodData.data;
                agregarAlCarrito({
                  id: prod.publicId,
                  nombre: prod.nombre,
                  imagen: prod.imagen || "/placeholder-product.png",
                  precio: prod.precio,
                  stock: prod.stock || 10,
                }, args.cantidad || 1);

                // Attach the matched product card to the bot message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          products: [...(msg.products || []).filter(p => p.id !== prod.publicId), {
                            id: prod.publicId,
                            nombre: prod.nombre,
                            descripcionCorta: prod.descripcionCorta || prod.descripcion || "",
                            descripcionLarga: prod.descripcionLarga || "",
                            precio: prod.precio,
                            imagen: prod.imagen || "/placeholder-product.png",
                            categoria: prod.categoria || "Soldadura",
                            marca: prod.marca || "Genérica",
                            disponible: prod.disponible ?? true,
                            stock: prod.stock ?? 10,
                            destacado: prod.destacado ?? false,
                            caracteristicas: prod.caracteristicas || [],
                            relacionados: prod.relacionados || [],
                          }],
                          showOptionsAfterAdd: true
                        }
                      : msg
                  )
                );
              }
            }
          } catch (err) {
            console.error("Error updating cart from response action", err);
          }
        } else if (toolCallName === "remove_from_cart" && args.productPublicId) {
          const removeFn = useCarritoStore.getState().eliminar;
          removeFn(args.productPublicId);
        }
      }

    } catch (err) {
      console.error("Error in sending message", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Lo siento, ocurrió un problema al procesar tu consulta.",
        },
      ]);
    }
  };

  const handleAddToCart = async (producto: Producto) => {
    if (!producto.disponible || producto.stock <= 0) return;

    // Add to Zustand Store
    agregarAlCarrito(
      {
        id: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: producto.precio,
        stock: producto.stock,
      },
      1,
    );

    // Synchronize to the backend session cart
    const activeSessionId = sessionId;
    if (activeSessionId) {
      try {
        await fetch(`/api/v1/chatbot/sessions/${activeSessionId}/cart/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productPublicId: producto.id,
            cantidad: 1
          })
        });
      } catch (err) {
        console.error("Failed to sync manual cart addition to backend", err);
      }
    }

    // Bot message indicating it was added and offering options
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-add-${Date.now()}`,
          sender: "bot",
          text: "Producto agregado al carrito correctamente. ¿Deseas seguir buscando más productos o comprar ahora?",
          showOptionsAfterAdd: true,
        },
      ]);
    }, 400);
  };

  const handleSearchMore = () => {
    // Add user message choice
    const userMsgId = `user-more-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: "user" as const, text: "Buscar más productos" },
    ];
    setMessages(newMessages);
    setIsTyping(true);

    // El producto recién añadido ya está en el carrito local. Usamos ese estado
    // para mostrar el resumen de inmediato, sin requerir otra consulta al API.
    const cartItems: CartMessageItem[] = useCarritoStore.getState().items.map((item) => ({
      productPublicId: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
      subtotal: item.precio * item.cantidad,
      imagen: item.imagen,
    }));

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-more-${Date.now()}`,
          sender: "bot",
          cartItems,
          text: cartItems.length > 0
            ? "¡Excelente! Puedes seguir buscando escribiendo tu consulta o usando las opciones rápidas. Este es el resumen actual de tu carrito:"
            : "¡Excelente! Puedes seguir buscando escribiendo tu consulta o usando las opciones rápidas.",
        },
      ]);
    }, 400);
  };

  const handleCheckoutNow = () => {
    // Navigate directly to cart page and skip stage 1 by setting query parameter 'etapa=2'
    setIsOpen(false);
    router.push("/carrito?etapa=2");
  };

  const lastMessage = messages[messages.length - 1];
  const isAwaitingCheckoutChoice = lastMessage?.showOptionsAfterAdd === true;

  return (
    <>
      {/* Botón flotante del Chatbot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir asistente de chat"
        className={cn(
          "bg-primary border-primary/20 fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-black shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen ? "text-primary border-white/10 bg-zinc-900" : "",
        )}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="animate-scale-up h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Notification pulse ring */}
            <span className="bg-primary/45 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="z-10 h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.237.18 2.228 1.196 2.441 2.446a48.553 48.553 0 0 1 1.157 11.23 3 3 0 0 1-2.5 2.945l-3.834.555a.75.75 0 0 0-.564.415l-3.235 6.016a.75.75 0 0 1-1.323-.047l-2.027-4.137a.75.75 0 0 0-.616-.442L2.73 18.72a3 3 0 0 1-2.5-2.945 48.47 48.47 0 0 1 1.158-11.23 3 3 0 0 1 2.46-2.774Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </button>

      {/* Ventana del Chatbot */}
      {isOpen && (
        <div className="border-white/8 animate-scale-up fixed bottom-24 right-6 z-50 flex h-[550px] max-h-[80vh] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-zinc-900 text-white shadow-2xl">
          {/* Encabezado */}
          <div className="border-white/8 flex shrink-0 items-center justify-between border-b bg-black px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 border-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-lg border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4.5 h-4.5"
                >
                  <path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6ZM10 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight">
                  Asistente Marweld
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  <span className="text-[10px] font-medium text-white/40">
                    En línea
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/40 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              aria-label="Cerrar chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="chat-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto bg-zinc-950/20 p-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1.5 text-sm",
                  msg.sender === "user"
                    ? "items-end self-end"
                    : "items-start self-start",
                )}
              >
                <div
                  className={cn(
                    "whitespace-pre-line rounded-2xl p-3 leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary shadow-primary/5 rounded-tr-none font-semibold text-black shadow-md"
                      : "rounded-tl-none border border-white/5 bg-zinc-900 text-white/90",
                  )}
                >
                  <MarkdownMessage text={msg.text || ""} />
                </div>

                {/* Render cards for products matches */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-1 flex w-[292px] max-w-full flex-col gap-2.5">
                    {msg.products.slice(0, 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="border-primary/15 flex gap-3 rounded-xl border bg-zinc-900/80 p-2.5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-150 hover:border-primary/40"
                      >
                        {/* Image */}
                        <div className="border-white/8 h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {/* Details */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="block text-xs font-bold leading-snug">
                              {prod.nombre}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                              {prod.marca} · {prod.categoria}
                            </span>
                            <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/55">
                              {prod.descripcionCorta || prod.descripcionLarga}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/6 pt-2">
                            <span className="text-primary text-xs font-black">
                              S/ {prod.precio.toFixed(2)}
                            </span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-bold",
                                prod.disponible && prod.stock > 0
                                  ? "bg-green-400/10 text-green-400"
                                  : "bg-red-400/10 text-red-400",
                              )}
                            >
                              {prod.disponible && prod.stock > 0
                                ? "Stock"
                                : "Sin Stock"}
                            </span>
                          </div>
                          {/* Card buttons */}
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            <Link
                              href={`/producto/${prod.id}`}
                              className="border-white/8 rounded border py-1.5 text-center text-[10px] font-bold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                            >
                              Ver producto
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod)}
                              disabled={!prod.disponible || prod.stock <= 0}
                              className={cn(
                                "rounded py-1 text-[10px] font-black transition-all",
                                prod.disponible && prod.stock > 0
                                  ? "bg-primary text-black hover:brightness-95 active:scale-[0.97]"
                                  : "border-white/8 cursor-not-allowed border bg-white/5 text-white/20",
                              )}
                            >
                              {prod.disponible && prod.stock > 0
                                ? "Agregar"
                                : "Sin stock"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {msg.products.length > 4 && (
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="text-primary block py-1 text-center text-[11px] font-bold hover:underline"
                      >
                        Ver los otros {msg.products.length - 4} productos en el
                        catálogo
                      </Link>
                    )}
                  </div>
                )}

                {msg.cartItems && msg.cartItems.length > 0 && (
                  <div className="border-primary/20 mt-1 w-[292px] max-w-full overflow-hidden rounded-xl border bg-zinc-900/90 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center justify-between border-b border-white/7 bg-black/30 px-3 py-2">
                      <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-white/70">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-primary h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-1.2 1.2a1 1 0 0 0 .7 1.7H17m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
                        </svg>
                        Carrito actual
                      </span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        {msg.cartItems.reduce((total, item) => total + item.cantidad, 0)} uds.
                      </span>
                    </div>
                    <div className="divide-y divide-white/6">
                      {msg.cartItems.map((item, itemIndex) => (
                        <div key={`${item.productPublicId || item.nombre}-${itemIndex}`} className="flex gap-2.5 p-2.5">
                          <div className="border-white/8 h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-zinc-800">
                            {item.product?.imagen || item.imagen ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.product?.imagen || item.imagen} alt={item.nombre} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-primary flex h-full w-full items-center justify-center text-xs font-black">MW</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold leading-snug text-white">{item.nombre}</p>
                            <p className="mt-0.5 text-[10px] text-white/45">
                              {item.cantidad} × S/ {formatCurrency(item.precioUnitario)}
                            </p>
                          </div>
                          <p className="text-primary self-center text-[11px] font-black">S/ {formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/7 bg-black/25 px-3 py-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white/55">Total</span>
                        <span className="text-primary font-black">
                          S/ {formatCurrency(msg.cartItems.reduce((total, item) => total + item.subtotal, 0))}
                        </span>
                      </div>
                      <Link
                        href="/carrito"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 block rounded-lg bg-primary py-1.5 text-center text-[10px] font-black text-black transition-transform hover:brightness-95 active:scale-[0.98]"
                      >
                        Ver carrito y comprar
                      </Link>
                    </div>
                  </div>
                )}

                {/* Render yes/no option buttons after adding to cart */}
                {msg.showOptionsAfterAdd && (
                  <div className="mt-2 flex w-full max-w-[280px] flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSearchMore}
                      className="border-white/8 flex-1 rounded-xl border py-2 text-xs font-bold text-white transition-colors hover:bg-white/5 active:scale-[0.98]"
                    >
                      Buscar más productos
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckoutNow}
                      className="bg-primary flex-1 rounded-xl py-2 text-xs font-bold text-black transition-all hover:brightness-95 active:scale-[0.98]"
                    >
                      Comprar ahora
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 self-start rounded-2xl rounded-tl-none border border-white/5 bg-zinc-900 p-3">
                <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full delay-75" />
                <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full delay-150" />
                <span className="bg-primary delay-225 h-1.5 w-1.5 animate-bounce rounded-full" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips (Opciones Rápidas) */}
          {!isAwaitingCheckoutChoice && (
            <section className="border-white/8 shrink-0 border-t bg-zinc-900">
              <button
                type="button"
                onClick={() => setIsQuickRepliesOpen((isOpen) => !isOpen)}
                aria-expanded={isQuickRepliesOpen}
                aria-controls="chatbot-quick-replies"
                className="group flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/[0.025]"
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 group-hover:text-white/80">
                  <span className="bg-primary h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--primary)]" />
                  Mensajes rápidos
                  <span className="rounded-full border border-white/8 bg-black/20 px-1.5 py-0.5 text-[9px] tracking-normal text-white/35">
                    {QUICK_CHIPS.length}
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={cn(
                    "h-3.5 w-3.5 text-white/40 transition-transform duration-200",
                    isQuickRepliesOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id="chatbot-quick-replies"
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                  isQuickRepliesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="chat-scrollbar flex max-h-[112px] flex-wrap gap-1.5 overflow-y-auto px-3 pb-3">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        disabled={isTyping}
                        className="border-white/6 hover:border-primary/40 hover:text-primary rounded-full border bg-zinc-950 px-2.5 py-1 text-xs text-white/70 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Formulario de envío de mensajes */}
          <form
            onSubmit={handleSendMessage}
            className="border-white/8 flex shrink-0 items-center gap-2 border-t bg-black/60 p-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAwaitingCheckoutChoice || isTyping}
              placeholder={
                isAwaitingCheckoutChoice
                  ? "Selecciona una opción arriba..."
                  : "Escribe tu consulta..."
              }
              className="border-white/8 focus:border-primary flex-1 rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={
                !inputValue.trim() || isAwaitingCheckoutChoice || isTyping
              }
              className="bg-primary shadow-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-black shadow-md transition-all hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Enviar mensaje"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4.5 h-4.5 translate-x-[-1px] translate-y-[1px] rotate-45 transform"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
