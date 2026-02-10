import toast from "react-hot-toast";
import { useAuthState } from "../features/auth/authHooks";
import { useUpsertCartItem } from "../features/cart/cartHooks";
import { useProfile } from "../features/profile/profileHooks";
import type { ConsumerProfile } from "../types/api";

interface AddToCartButtonProps {
  productId: string;
  className: string;
}

export const AddToCartButton = ({ productId, className }: AddToCartButtonProps) => {
  const { user } = useAuthState();
  const profileQuery = useProfile(user?.role === "consumer");
  const upsertCart = useUpsertCartItem();

  const consumerProfile =
    profileQuery.data?.role === "consumer" && profileQuery.data.profile
      ? (profileQuery.data.profile as ConsumerProfile)
      : null;

  const isConsumerProfileComplete =
    consumerProfile !== null &&
    consumerProfile.fullName.trim().length > 0 &&
    consumerProfile.mobileNumber.trim().length > 0 &&
    consumerProfile.deliveryContacts.length > 0;

  return (
    <button
      type="button"
      className={className}
      disabled={user?.role === "shopkeeper"}
      onClick={async () => {
        if (user?.role === "consumer" && !isConsumerProfileComplete) {
          toast.error("profile incomplete");
          return;
        }

        try {
          await upsertCart.mutateAsync({ productId, quantity: 1 });
        } catch {
          toast.error("Add to cart failed");
        }
      }}
    >
      {user?.role === "shopkeeper" ? "Consumers Only" : "Add to Cart"}
    </button>
  );
};
