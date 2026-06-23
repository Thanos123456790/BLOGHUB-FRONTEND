"use client";

import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { LogOutIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DangerZoneSection() {
  const { signOut } = useClerk();

  async function handleLogOut() {
    try {
      await signOut({ redirectUrl: "/login" });
    } catch {
      toast.error("Couldn't log out. Please try again.");
    }
  }

  return (
    <Card className="py-5 border-destructive/30">
      <CardHeader className="px-5 pt-0">
        <CardTitle className="flex items-center gap-2">
          <TriangleAlertIcon className="size-4 text-destructive" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Log out ends your Clerk session for real. Deactivation is demo-only
          — nothing is permanently deleted.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2" onClick={handleLogOut}>
          <LogOutIcon className="size-4" />
          Log out
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              Deactivate account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate your account?</DialogTitle>
              <DialogDescription>
                Your profile and posts would be hidden until you log back in.
                This is a demo, so nothing will actually change.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() =>
                  toast("Account deactivation isn't enabled in this demo.")
                }
              >
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
