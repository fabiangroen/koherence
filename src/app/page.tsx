import { ThemeToggle } from "@/components/themetoggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CircleUserRound } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="w-full flex items-center px-4 py-2 gap-4 bg-background border-b border-border">
        <div className="text-2xl">Koherence</div>
        <div className="flex-1"></div>
        <ThemeToggle />
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div >
  );
}
