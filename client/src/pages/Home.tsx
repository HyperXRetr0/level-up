import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useLatestProductsQuery } from "../redux/api/product";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { CartItem } from "../types/types";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";

const Home = () => {
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useLatestProductsQuery("");
  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
  };
  if (isError) toast.error("Cannot Fetch Products");
  return (
    <div className="home">
      <section></section>
      <h1>
        Latest Titles
        <Link to={"/search"} className="findmore">
          More
        </Link>
      </h1>
      <main>
        {isLoading ? (
          <Loader />
        ) : (
          data?.products.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              handler={addToCartHandler}
              imgUrl={product.imgUrl}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Home;
