import Navbar from "../../src/components/layout/navbar";
import Footer from "../../src/components/layout/footer";
import { Chatbot } from "../../src/components/chatbot/chatbot";

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-screen flex-col bg-zinc-950"><Navbar /><main className="flex-1">{children}</main><Footer /><Chatbot /></div>;
}
