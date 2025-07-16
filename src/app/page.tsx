import { ThemeToggle } from "@/components/themetoggle";
import SignIn from "@/components/sign-button";
import { CircleUserRound } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="w-full flex items-center px-4 py-2 gap-4 bg-background border-b border-border">
        <div className="text-2xl">Koherence</div>
        <div className="flex-1"></div>
        <ThemeToggle />
        <SignIn />
      </div>
    </div >
  );
}
