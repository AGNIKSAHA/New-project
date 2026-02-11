import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/productHooks";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { AddToCartButton } from "../components/AddToCartButton";

const parseNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search");

  const category = searchParams.get("category") ?? "";
  const minPrice = parseNumber(searchParams.get("minPrice"));
  const maxPrice = parseNumber(searchParams.get("maxPrice"));
  const page = parseNumber(searchParams.get("page")) ?? 1;

  const query = {
    page,
    limit: 9,
    ...(navbarSearch ? { search: navbarSearch } : {}),
    ...(category ? { category } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
  };

  const productsQuery = useProducts(query);

  if (productsQuery.isLoading) {
    return <Loader label="Loading products..." />;
  }

  const data = productsQuery.data;
  const products = data?.items ?? [];
  const pagination = data?.pagination;

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);

    if (value.trim().length === 0) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (page: number): void => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Products</h1>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <input
            id="category"
            name="category"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            defaultValue={category}
            onBlur={(e) => setFilter("category", e.target.value)}
            placeholder="fashion"
          />
        </div>
        <div>
          <label
            htmlFor="min-price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Min Price
          </label>
          <input
            id="min-price"
            name="minPrice"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            type="number"
            min={0}
            defaultValue={minPrice ?? ""}
            onBlur={(e) => setFilter("minPrice", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label
            htmlFor="max-price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Max Price
          </label>
          <input
            id="max-price"
            name="maxPrice"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            type="number"
            min={0}
            defaultValue={maxPrice ?? ""}
            onBlur={(e) => setFilter("maxPrice", e.target.value)}
            placeholder="999"
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No products found"
            description="Try different search or filters."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="relative rounded-2xl border border-slate-200 bg-white p-4"
            >
              {product.stock === 0 && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  Out of Stock
                </span>
              )}
              <img
                src={product.imageUrl}
                alt={product.title}
                className={`h-48 w-full rounded-xl object-cover ${product.stock === 0 ? "opacity-50 grayscale" : ""}`}
              />
              <h3 className="mt-4 text-lg font-semibold">{product.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {product.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-bold text-brand-700">
                  ${product.price}
                </p>
                <p
                  className={`text-sm font-medium ${
                    product.stock === 0
                      ? "text-red-600"
                      : product.stock <= 5
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of stock"
                    : product.stock <= 5
                      ? `Only ${product.stock} left`
                      : `${product.stock} in stock`}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <AddToCartButton
                  productId={product.id}
                  stock={product.stock}
                  className="rounded-lg bg-brand-700 px-3 py-2 text-sm text-white"
                />
                <Link
                  to={`/products/${product.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} products)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
