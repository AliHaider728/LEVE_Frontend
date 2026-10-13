import { useEffect } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { CircleUserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, init, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    void init();
  }, [init]);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" magnetic={false} aria-label="Account menu">
          <CircleUserRound />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        {user ? (
          <>
            <DropdownMenuLabel className="truncate text-xs">Hi, {user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/account">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account" search={{ tab: "orders" }}>
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/wishlist">
                Wishlist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await logout();
                toast.success("Logged out");
                void navigate({ to: "/" });
              }}
            >
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/login">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/register">Register</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
