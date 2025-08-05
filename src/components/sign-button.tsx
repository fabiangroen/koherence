import { Button } from '@/components/ui/button';
import { signIn, signOut } from '@/auth';
import { auth } from '@/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default async function SignIn() {
  const session = await auth();

  if (!session?.user)
    return (
      <form
        action={async () => {
          'use server';
          await signIn('google');
        }}
      >
        <Button type="submit">Sign in</Button>
      </form>
    );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:cursor-pointer">
          <Avatar>
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col w-auto gap-2">
        <p className="text-muted-foreground text-sm">{session?.user.email}</p>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <Button className=" w-full" type="submit">
            Sign out
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
