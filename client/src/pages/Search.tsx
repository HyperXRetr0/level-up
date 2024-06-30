import { useState } from "react";
import ProductCard from "../components/ProductCard";
import {
  useCategoriesQuery,
  useSearchProductsQuery,
} from "../redux/api/product";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { CartItem } from "../types/types";
import { addToCart } from "../redux/reducer/cartReducer";

const Search = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
  };
  const isPrevPage = page > 1;
  const isNextPage = page < 4;
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategoriesQuery("");
  if (categoryError) toast.error("Cannot Fetch Categories");

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useSearchProductsQuery({
    search,
    sort,
    price: maxPrice,
    category,
    page,
  });
  if (searchError) toast.error("Cannot Fetch Products");

  return (
    <div className="product-search-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="asc">Price (Low - High)</option>
            <option value="desc">Price (High - Low)</option>
          </select>
        </div>
        <div>
          <h4>Max Price: {maxPrice || ""}</h4>
          <input
            type="range"
            min={100}
            max={4000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">ALL</option>
            {!categoryLoading &&
              categoryData?.categories.map((category) => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
          </select>
        </div>
      </aside>
      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="search-product-list">
          {searchData?.products.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              handler={addToCartHandler}
              imgUrl={product.imgUrl}
            />
          ))}
        </div>
        {searchData?.totalPage! > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              {page} of {searchData?.totalPage}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
};

export default Search;
