import { useParams } from "react-router-dom";
import { useProduct } from "../features/products/productHooks";
import { Loader } from "../components/Loader";
import { AddToCartButton } from "../components/AddToCartButton";

export const ProductDetailsPage = () => {
  const { productId = "" } = useParams();
  const productQuery = useProduct(productId);

  if (productQuery.isLoading) {
    return <Loader label="Loading product..." />;
  }

  const product = productQuery.data;
  if (!product) {
    return <p className="text-slate-600">Product not found.</p>;
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <img src={product.imageUrl} alt={product.title} className="w-full rounded-2xl object-cover" />
      <div>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="mt-4 text-slate-600">{product.description}</p>
        <p className="mt-6 text-2xl font-bold text-brand-700">${product.price}</p>
        <AddToCartButton
          productId={product.id}
          className="mt-6 rounded-lg bg-brand-700 px-5 py-2.5 text-white"
        />
      </div>
    </section>
  );
};
