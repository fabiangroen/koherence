"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "@/auth";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, Settings } from "lucide-react";

export default function SignIn() {
  const { data: session } = useSession();
  const [isRightClick, setIsRightClick] = useState(false);
  const [open, setOpen] = useState(false);

  if (!session?.user)
    return (
      <Button onClick={() => signIn("google")}>
        <LogIn />
        Sign in
      </Button>
    );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRightClick(true);
    setOpen(true);
  };

  const handlePopoverOpen = (openState: boolean) => {
    setOpen(openState);
    // Reset right-click state when popover closes
    if (!openState) {
      setIsRightClick(false);
    }
  };

  const handleClick = () => {
    setIsRightClick(false);
    // Toggle popover if it's not already open from a right-click
    if (!open) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handlePopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:cursor-pointer"
          onContextMenu={handleContextMenu}
          onClick={handleClick}
        >
          <Avatar>
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col w-auto gap-2">
        <p className="text-muted-foreground text-sm">{session?.user.email}</p>
        {isRightClick && session.user.role === "admin" && (
          <Link href="/admin">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              <Settings />
              Admin
            </Button>
          </Link>
        )}
        <Button className="w-full" onClick={() => signOut()}>
          <LogOut />
          Sign out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
