'use client';

import React, { useContext } from 'react';
import type { Book } from '@/lib/types';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogContainer,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
  useMorphingDialog,
} from '@/components/ui/morphing-dialog';
import { cn } from '@/lib/utils';

// 1. Create a new context for the book data
export type BookContextType = {
  book?: Book;
};

const BookContext = React.createContext<BookContextType | null>(null);

// 2. Create a hook to consume the book context
export function useBookContext() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error(
      'useBookContext must be used within a BookMorphingDialog'
    );
  }
  return context;
}

// 3. Create the BookMorphingDialog component
export type BookMorphingDialogProps = {
  children: React.ReactNode;
  book: Book;
};

export function BookMorphingDialog({ children, book }: BookMorphingDialogProps) {
  return (
    <BookContext.Provider value={{ book }}>
      <MorphingDialog>{children}</MorphingDialog>
    </BookContext.Provider>
  );
}

// 4. Re-export the generic MorphingDialog components with custom styling
export function BookMorphingDialogTrigger(props: React.ComponentProps<typeof MorphingDialogTrigger>) {
  return <MorphingDialogTrigger {...props} />;
}

export function BookMorphingDialogContent(props: React.ComponentProps<typeof MorphingDialogContent>) {
  return (
    <MorphingDialogContent
      className={cn('overflow-hidden bg-card text-card-foreground rounded-xl border p-6', props.className)}
      {...props}
    />
  );
}

export function BookMorphingDialogContainer(props: React.ComponentProps<typeof MorphingDialogContainer>) {
  return (
    <MorphingDialogContainer
      className={cn('fixed inset-0 h-full w-full bg-black/50', props.className)}
      {...props}
    />
  );
}

export function BookMorphingDialogClose(props: React.ComponentProps<typeof MorphingDialogClose>) {
  return <MorphingDialogClose {...props} />;
}

export function BookMorphingDialogTitle(props: React.ComponentProps<typeof MorphingDialogTitle>) {
  return <MorphingDialogTitle {...props} />;
}

export function BookMorphingDialogSubtitle(props: React.ComponentProps<typeof MorphingDialogSubtitle>) {
  return <MorphingDialogSubtitle {...props} />;
}

export function BookMorphingDialogDescription(props: React.ComponentProps<typeof MorphingDialogDescription>) {
  return <MorphingDialogDescription {...props} />;
}

export function BookMorphingDialogImage(props: React.ComponentProps<typeof MorphingDialogImage>) {
  return <MorphingDialogImage {...props} />;
}