import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cartReducerInitialState } from "../types/reducer-types";
import axios from "axios";
import { server, RootState } from "../redux/store";
import toast from "react-hot-toast";
import { saveShippingInfo } from "../redux/reducer/cartReducer";

const Shipping = () => {
  const dispatch = useDispatch();
  const { cartItems, total } = useSelector(
    (state: { cartReducer: cartReducerInitialState }) => state.cartReducer
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length <= 0) return navigate("/cart");
  }, [cartItems]);

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(saveShippingInfo(shippingInfo));
    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/create`,
        {
          amount: total,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/pay", {
        state: data.clientSecret,
      });
    } catch (error) {
      toast.error("Something Went Wrong");
    }
  };
  return (
    <div className="shipping">
      <button className="back-btn" onClick={() => navigate("/cart")}>
        <BiArrowBack />
      </button>
      <form onSubmit={submitHandler}>
        <h1>Shipping Address</h1>
        <input
          required
          type="text"
          placeholder="Address"
          name="address"
          value={shippingInfo.address}
          onChange={changeHandler}
        />
        <input
          required
          type="text"
          placeholder="City"
          name="city"
          value={shippingInfo.city}
          onChange={changeHandler}
        />
        <input
          required
          type="text"
          placeholder="State"
          name="state"
          value={shippingInfo.state}
          onChange={changeHandler}
        />
        <select
          name="country"
          id=""
          required
          value={shippingInfo.country}
          onChange={changeHandler}
        >
          <option value="">Select Country</option>
          <option value="india">India</option>
          <option value="usa">USA</option>
          <option value="uk">United Kingdom</option>
        </select>
        <input
          required
          type="number"
          placeholder="Pin Code"
          name="pincode"
          value={shippingInfo.pincode}
          onChange={changeHandler}
        />
        <button type="submit">Pay</button>
      </form>
    </div>
  );
};

export default Shipping;
