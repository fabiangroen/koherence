import { ThemeToggle } from "@/components/themetoggle";
import SignIn from "@/components/sign-button";
import CardGrid from "@/components/card-grid";

function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-background border-b border-border">
      <h1 className="text-2xl">Koherence</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <SignIn />
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CardGrid />
    </div>
  );
}
