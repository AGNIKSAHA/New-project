import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type { Product, ProductListResult, ProductQuery } from "../../types/api";

export const productsApi = {
  list(query: ProductQuery): Promise<ProductListResult> {
    return unwrap(
      http.get("/products", {
        params: {
          search: query.search,
          category: query.category,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          page: query.page,
          limit: query.limit
        }
      })
    );
  },
  getById(id: string): Promise<Product> {
    return unwrap(http.get(`/products/${id}`));
  },
  listMine(): Promise<Product[]> {
    return unwrap(http.get("/products/mine"));
  },
  create(payload: Omit<Product, "id">): Promise<Product> {
    return unwrap(http.post("/products", payload));
  },
  update(id: string, payload: Partial<Omit<Product, "id">>): Promise<Product> {
    return unwrap(http.patch(`/products/${id}`, payload));
  },
  remove(id: string): Promise<null> {
    return unwrap(http.delete(`/products/${id}`));
  }
};
