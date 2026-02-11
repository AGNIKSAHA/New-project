import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "../features/auth/authHooks";
import { useCancelOrder, useOrders } from "../features/orders/orderHooks";
import { useCancelPaidOrder } from "../features/payment/paymentHooks";
import {
  useDeleteProduct,
  useMyProducts,
  useUpdateProduct,
} from "../features/products/productHooks";
import { Loader } from "../components/Loader";
import { ConfirmModal } from "../components/ConfirmModal";
import toast from "react-hot-toast";

export const DashboardPage = () => {
  const { user } = useAuthState();

  const ordersQuery = useOrders(user?.role === "consumer");
  const cancelOrder = useCancelOrder();
  const cancelPaidOrder = useCancelPaidOrder();

  const productsQuery = useMyProducts(user?.role === "shopkeeper");
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // Confirmation modal state
  const [cancelTarget, setCancelTarget] = useState<{
    orderId: string;
    type: "pending" | "paid";
    total: number;
  } | null>(null);

  if (!user) {
    return null;
  }

  if (user.role === "consumer" && ordersQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (user.role === "shopkeeper" && productsQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const startEdit = (product: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
    category: string;
  }): void => {
    setEditingProductId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditImageUrl(product.imageUrl);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditCategory(product.category);
  };

  const saveEdit = async (id: string): Promise<void> => {
    try {
      await updateProduct.mutateAsync({
        id,
        payload: {
          title: editTitle,
          description: editDescription,
          imageUrl: editImageUrl,
          price: Number(editPrice),
          stock: Number(editStock),
          category: editCategory,
        },
      });
      setEditingProductId(null);
    } catch {
      toast.error("Product update failed");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="mt-2 text-sm text-slate-600">Role: {user.role}</p>
        {user.role === "shopkeeper" && (
          <Link
            className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white"
            to="/shopkeeper/products/new"
          >
            Add New Product
          </Link>
        )}
      </div>

      {user.role === "consumer" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-slate-600">Status: {order.status}</p>
                <p className="text-sm text-slate-600">
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">
                  Recipient: {order.shippingDetails.recipientName}
                </p>
                <p className="text-sm text-slate-600">
                  Address: {order.shippingDetails.address}
                </p>
                <p className="text-sm text-slate-600">
                  Mobile: {order.shippingDetails.mobileNumber}
                </p>
                {order.shippingDetails.alternateNumber && (
                  <p className="text-sm text-slate-600">
                    Alternate: {order.shippingDetails.alternateNumber}
                  </p>
                )}
                {order.status === "pending" && (
                  <button
                    type="button"
                    className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700"
                    onClick={() =>
                      setCancelTarget({
                        orderId: order.id,
                        type: "pending",
                        total: order.totalAmount,
                      })
                    }
                  >
                    Cancel Order
                  </button>
                )}
                {order.status === "paid" && (
                  <button
                    type="button"
                    className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"
                    onClick={() =>
                      setCancelTarget({
                        orderId: order.id,
                        type: "paid",
                        total: order.totalAmount,
                      })
                    }
                  >
                    Cancel & Refund
                  </button>
                )}
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-slate-600">No orders yet.</p>
            )}
          </div>
        </div>
      )}

      {user.role === "shopkeeper" && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Manage Products</h2>
            <div className="mt-4 space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  {editingProductId === product.id ? (
                    <div className="space-y-3">
                      <input
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <input
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          className="rounded border border-slate-300 px-3 py-2"
                          type="number"
                          min={1}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                        <input
                          className="rounded border border-slate-300 px-3 py-2"
                          type="number"
                          min={0}
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                        />
                        <input
                          className="rounded border border-slate-300 px-3 py-2"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-brand-700 px-3 py-1.5 text-white"
                          onClick={() => void saveEdit(product.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-3 py-1.5"
                          onClick={() => setEditingProductId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-slate-600">
                        {product.description}
                      </p>
                      <p className="text-sm text-slate-600">
                        Price: ${product.price}
                      </p>
                      <p className="text-sm text-slate-600">
                        Stock: {product.stock}
                      </p>
                      <p className="text-sm text-slate-600">
                        Category: {product.category}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                          onClick={() => startEdit(product)}
                        >
                          Edit Product
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
                          onClick={async () => {
                            try {
                              await deleteProduct.mutateAsync(product.id);
                            } catch {
                              toast.error("Delete failed");
                            }
                          }}
                        >
                          Remove Product
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-slate-600">No products found.</p>
              )}
            </div>
          </div>
        </>
      )}
      {/* Cancel confirmation modal */}
      <ConfirmModal
        open={cancelTarget !== null}
        title={
          cancelTarget?.type === "paid"
            ? "Cancel Order & Request Refund?"
            : "Cancel Order?"
        }
        message={
          cancelTarget?.type === "paid"
            ? `This will cancel your order and initiate a refund of $${cancelTarget.total.toFixed(2)} to your original payment method. This action cannot be undone.`
            : "Are you sure you want to cancel this order? This action cannot be undone."
        }
        confirmLabel={
          cancelTarget?.type === "paid"
            ? "Yes, Cancel & Refund"
            : "Yes, Cancel Order"
        }
        cancelLabel="Keep Order"
        variant="danger"
        loading={cancelOrder.isPending || cancelPaidOrder.isPending}
        onCancel={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          try {
            if (cancelTarget.type === "paid") {
              await cancelPaidOrder.mutateAsync(cancelTarget.orderId);
            } else {
              await cancelOrder.mutateAsync(cancelTarget.orderId);
            }
            setCancelTarget(null);
          } catch {
            toast.error(
              cancelTarget.type === "paid"
                ? "Cancel & refund failed"
                : "Cancel failed",
            );
          }
        }}
      />
    </section>
  );
};
