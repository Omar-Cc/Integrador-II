import Navbar from "../../src/components/layout/navbar";
import Footer from "../../src/components/layout/footer";
import { Chatbot } from "../../src/components/chatbot/chatbot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
