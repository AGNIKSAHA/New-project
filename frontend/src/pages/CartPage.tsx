import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart, useRemoveCartItem, useUpsertCartItem } from "../features/cart/cartHooks";
import { useCreateOrder } from "../features/orders/orderHooks";
import { useProfile } from "../features/profile/profileHooks";
import type { ConsumerProfile } from "../types/api";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";

const phoneRegex = /^[0-9]{7,15}$/;

export const CartPage = () => {
  const cartQuery = useCart();
  const profileQuery = useProfile();
  const removeItem = useRemoveCartItem();
  const upsertItem = useUpsertCartItem();
  const createOrder = useCreateOrder();

  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const consumerProfile = profileQuery.data?.role === "consumer" ? (profileQuery.data.profile as ConsumerProfile | null) : null;
  const deliveryContacts = consumerProfile?.deliveryContacts ?? [];

  useEffect(() => {
    if (!consumerProfile) {
      return;
    }

    if (mobileNumber.trim().length === 0) {
      setMobileNumber(consumerProfile.mobileNumber ?? "");
    }

    if (alternateNumber.trim().length === 0) {
      setAlternateNumber(consumerProfile.alternateNumber ?? "");
    }
  }, [consumerProfile, mobileNumber, alternateNumber]);

  if (cartQuery.isLoading || profileQuery.isLoading) {
    return <Loader label="Loading cart..." />;
  }

  const lines = cartQuery.data ?? [];
  if (lines.length === 0) {
    return <EmptyState title="Your cart is empty" description="Add items from the products page." />;
  }

  const total = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);

  const onSelectSavedContact = (indexValue: string): void => {
    setSelectedDeliveryIndex(indexValue);

    if (indexValue === "") {
      return;
    }

    const contact = deliveryContacts[Number(indexValue)];
    if (!contact) {
      return;
    }

    setRecipientName(contact.recipientName);
    setAddress(contact.address);
  };

  const onPlaceOrder = async (): Promise<void> => {
    if (recipientName.trim().length < 2) {
      toast.error("Please enter recipient name");
      return;
    }

    if (address.trim().length < 5) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!phoneRegex.test(mobileNumber)) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }

    if (alternateNumber && !phoneRegex.test(alternateNumber)) {
      toast.error("Enter a valid alternate number (7-15 digits)");
      return;
    }

    try {
      await createOrder.mutateAsync({
        shippingDetails: {
          recipientName: recipientName.trim(),
          address: address.trim(),
          mobileNumber: mobileNumber.trim(),
          ...(alternateNumber.trim().length > 0 ? { alternateNumber: alternateNumber.trim() } : {})
        }
      });
      setSelectedDeliveryIndex("");
      setRecipientName("");
      setAddress("");
      setMobileNumber(consumerProfile?.mobileNumber ?? "");
      setAlternateNumber(consumerProfile?.alternateNumber ?? "");
    } catch {
      toast.error("Order placement failed");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <div className="mt-6 space-y-3">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{line.product?.title ?? line.productId}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <span>Qty:</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2"
                  disabled={line.quantity <= 1 || upsertItem.isPending}
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity - 1
                      });
                    } catch {
                      toast.error("Quantity update failed");
                    }
                  }}
                >
                  -
                </button>
                <span className="min-w-6 text-center font-medium">{line.quantity}</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2"
                  disabled={upsertItem.isPending}
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity + 1
                      });
                    } catch {
                      toast.error("Quantity update failed");
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              onClick={async () => {
                try {
                  await removeItem.mutateAsync(line.productId);
                } catch {
                  toast.error("Remove failed");
                }
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-white p-5">
        <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="saved-delivery-contact" className="mb-1 block text-sm font-medium text-slate-700">
              Saved Name + Address (Optional)
            </label>
            <select
              id="saved-delivery-contact"
              name="savedDeliveryContact"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedDeliveryIndex}
              onChange={(event) => onSelectSavedContact(event.target.value)}
            >
              <option value="">Select saved contact</option>
              {deliveryContacts.map((entry, index) => (
                <option key={`${entry.recipientName}-${entry.address}-${index}`} value={index}>
                  {entry.recipientName} - {entry.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="order-recipient-name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="order-recipient-name"
              name="recipientName"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="order-address" className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              id="order-address"
              name="address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              rows={3}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="12 Main Street, NY"
              required
            />
          </div>

          <div>
            <label htmlFor="order-mobile-number" className="mb-1 block text-sm font-medium text-slate-700">
              Personal Mobile Number
            </label>
            <input
              id="order-mobile-number"
              name="mobileNumber"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              placeholder="9876543210"
              required
            />
          </div>

          <div>
            <label htmlFor="order-alternate-number" className="mb-1 block text-sm font-medium text-slate-700">
              Alternate Number
            </label>
            <input
              id="order-alternate-number"
              name="alternateNumber"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={alternateNumber}
              onChange={(event) => setAlternateNumber(event.target.value)}
              placeholder="9123456780"
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-white"
          disabled={createOrder.isPending}
          onClick={onPlaceOrder}
        >
          {createOrder.isPending ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </section>
  );
};
