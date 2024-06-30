import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import CartItemCard from "../components/CartItemCard";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cartReducerInitialState } from "../types/reducer-types";
import { CartItem } from "../types/types";
import {
  addToCart,
  calculatePrice,
  discountCheck,
  removeFromCart,
} from "../redux/reducer/cartReducer";
import axios from "axios";
import { server } from "../redux/store";

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems, subtotal, total, tax, shippingCharges, discount } =
    useSelector(
      (state: { cartReducer: cartReducerInitialState }) => state.cartReducer
    );
  const [couponCode, setIsCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);
  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity == cartItem.stock) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };
  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };
  const removeHandler = (productId: string) => {
    dispatch(removeFromCart(productId));
  };
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount?coupon=${couponCode}`)
        .then((res) => {
          console.log(res.data);
          dispatch(discountCheck(res.data.discount));
          dispatch(calculatePrice());
          setIsValidCouponCode(true);
        })
        .catch(() => {
          dispatch(discountCheck(0));
          dispatch(calculatePrice());
          setIsValidCouponCode(false);
        });
    }, 1000);
    return () => {
      clearTimeout(timeOutId);
      setIsValidCouponCode(false);
    };
  }, [couponCode]);
  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems]);
  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <CartItemCard
              key={index}
              cartItem={item}
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
            />
          ))
        ) : (
          <h1>No Items Added</h1>
        )}
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em className="red">-₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{total}</b>
        </p>
        <input
          type="text"
          value={couponCode}
          placeholder="Coupon Code"
          onChange={(e) => setIsCouponCode(e.target.value)}
        />
        {couponCode &&
          (isValidCouponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon Code <VscError />{" "}
            </span>
          ))}
        {cartItems.length > 0 && <Link to={"/shipping"}>Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;
