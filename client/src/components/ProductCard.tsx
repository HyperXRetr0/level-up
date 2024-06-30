import { FaPlus } from "react-icons/fa";
import { CartItem } from "../types/types";

type ProductsProp = {
  productId: string;
  imgUrl: string;
  name: string;
  price: number;
  stock: number;
  handler: (cartItem: CartItem) => string | undefined;
};

const server = "asdasdasdas";

const ProductCard = ({
  productId,
  imgUrl,
  name,
  price,
  stock,
  handler,
}: ProductsProp) => {
  return (
    <div className="product-card">
      <img src={`http://localhost:4000/${imgUrl}`} alt={name} />
      <p>{name}</p>
      <span>₹{price}</span>
      <div>
        <button
          onClick={() =>
            handler({ productId, imgUrl, name, price, stock, quantity: 1 })
          }
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
