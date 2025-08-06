"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader } from "@/components/ui/card";
import DeviceForm from "@/components/book/device-form";
import type { Book } from "@/lib/types";
import { BookImage } from "lucide-react";

export function BookCard({ book }: { book: Book }) {
  const { title, author, releaseDate, coverImg } = book;
  const hasCover = !coverImg.endsWith("none");

  const renderCover = (size: "card" | "dialog") => {
    const isCard = size === "card";
    const containerClasses = isCard
      ? "w-full aspect-[2/3] overflow-hidden rounded-t-xl"
      : "w-full h-full";

    const iconSize = isCard ? "w-24 h-24" : "w-12 h-12";
    const noCoverClasses = isCard
      ? "bg-muted flex flex-col items-center justify-center rounded-t-xl"
      : "bg-muted flex flex-col items-center justify-center";

    return hasCover ? (
      <div className={containerClasses}>
        <img
          src={coverImg}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : (
      <div className={`${containerClasses} ${noCoverClasses}`}>
        <BookImage className={`${iconSize} text-muted-foreground`} />
        <span className="text-sm text-muted-foreground">No cover</span>
      </div>
    );
  };

  const renderMetadata = (variant: "card" | "dialog") => {
    const isCard = variant === "card";
    const titleClasses = isCard
      ? "text-base text-center"
      : "text-lg font-semibold leading-tight";
    const metaClasses = isCard
      ? "text-xs text-center -mt-1 mb-2 text-muted-foreground"
      : "text-sm text-muted-foreground";

    return (
      <>
        <div className={titleClasses}>{title}</div>
        <div className={metaClasses}>
          {author} · {releaseDate}
        </div>
      </>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full h-full flex flex-col p-0 transition-all hover:scale-101 cursor-pointer">
          <CardHeader className="flex-1 flex flex-col items-center p-0">
            {renderCover("card")}
            {renderMetadata("card")}
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="flex flex-col md:flex-row p-0 overflow-hidden rounded-xl border items-stretch max-h-[90vh] max-w-4xl">
        {/* Cover Image */}
        <div className="w-full md:w-2/5 lg:w-2/5 relative bg-muted min-h-0">
          {renderCover("dialog")}
        </div>

        {/* Form + Metadata */}
        <div className="w-full md:w-3/5 lg:w-3/5 p-6 flex flex-col space-y-3 box-border overflow-y-auto">
          <div>
            <DialogTitle className="text-lg font-semibold leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {author} · {releaseDate}
            </DialogDescription>
          </div>
          <div className="border-t my-2" />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Sync to devices</h4>
            <DeviceForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
