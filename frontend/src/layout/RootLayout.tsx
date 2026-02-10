import { type FormEvent, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthState, useLogout } from "../features/auth/authHooks";
import { useUnreadNotificationsCount } from "../features/notifications/notificationHooks";

const navItemClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-md px-2 py-1 transition ${
    isActive ? "bg-brand-100 text-brand-800" : "text-slate-700 hover:bg-slate-100 hover:text-brand-700"
  }`;

export const RootLayout = () => {
  const { user } = useAuthState();
  const logout = useLogout();
  const unreadNotifications = useUnreadNotificationsCount(user?.role === "shopkeeper");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const onSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const value = search.trim();
    if (value.length === 0) {
      navigate("/products");
      return;
    }
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-brand-700">
            CommerceX
          </NavLink>
          <form className="flex-1" onSubmit={onSearch}>
            <input
              id="navbar-search"
              name="search"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
            />
          </form>
          <div className="flex items-center gap-5 text-sm font-medium">
            <NavLink to="/products" className={navItemClass}>
              Products
            </NavLink>
            {user?.role === "consumer" && (
              <NavLink to="/cart" className={navItemClass}>
                Cart
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/dashboard" className={navItemClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={navItemClass}>
                  Profile
                </NavLink>
                {user.role === "shopkeeper" && (
                  <NavLink to="/notifications" className={navItemClass}>
                    Notifications ({unreadNotifications.data?.count ?? 0})
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={() => logout.mutate()}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="rounded-lg bg-brand-700 px-3 py-1.5 text-white">
                Login
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-600">
        Built with React, TanStack Query, Redux Toolkit, React Router v7, and Node.js API.
      </footer>
    </div>
  );
};
