"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@marweld/ui/lib/utils";
import { useCarritoStore } from "../../features/carrito/stores/carrito.store";
import { productosMock } from "../../features/home/data/productos.mock";
import type { Producto } from "../../features/home/types/producto.types";

type Message = {
  id: string;
  sender: "bot" | "user";
  text?: string;
  products?: Producto[];
  showOptionsAfterAdd?: boolean;
};

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

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

  // Scroll to bottom when messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    submitMessage(userText, userText);
  };

  const handleChipClick = (chip: string) => {
    let searchTerm = chip;
    if (chip === "Cables eléctricos") {
      searchTerm = "alambre";
    }
    submitMessage(chip, searchTerm);
  };

  const submitMessage = (userDisplayText: string, searchKey: string) => {
    // Add user message
    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: "user" as const, text: userDisplayText },
    ];
    setMessages(newMessages);
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const searchResult = performSearch(searchKey);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: searchResult.text,
          products: searchResult.products,
        },
      ]);
    }, 600);
  };

  const performSearch = (
    query: string,
  ): { text: string; products: Producto[] } => {
    const cleanQuery = normalizeText(query);

    if (
      cleanQuery.includes("envio") ||
      cleanQuery.includes("recojo") ||
      cleanQuery.includes("delivery") ||
      cleanQuery.includes("tienda")
    ) {
      return {
        text: "En Marweld Perú ofrecemos dos modalidades de entrega:\n\n• **Recojo en Tienda (Gratis)**: Recoge tu pedido sin costo adicional en nuestra sede de Ate (Av. Industrial 123).\n\n• **Delivery a Domicilio**: Costo de envío general de S/ 15.00 a cualquier parte de Lima. ¡Y el envío es totalmente **GRATIS** en compras mayores a S/ 500.00!",
        products: [],
      };
    }

    if (
      cleanQuery === "ofertas" ||
      cleanQuery.includes("oferta") ||
      cleanQuery.includes("descuento")
    ) {
      const matching = productosMock.filter(
        (p) => p.precioAnterior !== undefined && p.precioAnterior > p.precio,
      );
      return {
        text:
          matching.length > 0
            ? "¡Aquí tienes nuestras mejores ofertas con descuentos especiales!"
            : "Por el momento no tenemos ofertas activas, pero nuestros precios son los mejores del mercado.",
        products: matching,
      };
    }

    if (
      cleanQuery === "productos disponibles" ||
      cleanQuery.includes("disponible") ||
      cleanQuery.includes("stock")
    ) {
      const matching = productosMock.filter((p) => p.disponible && p.stock > 0);
      return {
        text: "Tenemos una gran variedad de productos en stock listos para entrega inmediata. Aquí algunos de ellos:",
        products: matching,
      };
    }

    // Split search keywords
    const keywords = cleanQuery.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      return {
        text: "Por favor, escribe una palabra o término de búsqueda.",
        products: [],
      };
    }

    // Filter products
    const matching = productosMock.filter((p) => {
      const textToSearch = normalizeText(
        `${p.nombre} ${p.categoria} ${p.marca} ${p.descripcionCorta} ${p.descripcionLarga}`,
      );
      return keywords.every((kw) => textToSearch.includes(kw));
    });

    if (matching.length > 0) {
      return {
        text: `Encontré ${matching.length} producto${matching.length === 1 ? "" : "s"} relacionado${matching.length === 1 ? "" : "s"}:`,
        products: matching,
      };
    } else {
      return {
        text: "No encontré productos relacionados, intenta con otra palabra o revisa el catálogo.",
        products: [],
      };
    }
  };

  const handleAddToCart = (producto: Producto) => {
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

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-more-${Date.now()}`,
          sender: "bot",
          text: "¡Excelente! Puedes seguir buscando escribiendo tu consulta o usando las opciones rápidas.",
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
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-zinc-950/20 p-4">
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
                  {msg.text}
                </div>

                {/* Render cards for products matches */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-1 flex w-[280px] max-w-full flex-col gap-2.5">
                    {msg.products.slice(0, 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="border-white/6 flex gap-3 rounded-xl border bg-zinc-900/60 p-2.5 text-white transition-all duration-150 hover:border-white/10"
                      >
                        {/* Image */}
                        <div className="border-white/6 h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-zinc-800">
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
                            <span className="block truncate text-xs font-bold">
                              {prod.nombre}
                            </span>
                            <span className="text-[10px] text-white/45">
                              {prod.marca}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
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
                              className="border-white/8 rounded border py-1 text-center text-[10px] font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                            >
                              Ver detalle
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
            <div className="border-white/8 flex max-h-[135px] shrink-0 flex-wrap gap-1.5 overflow-y-auto border-t bg-zinc-900 p-3">
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
