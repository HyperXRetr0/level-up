import { ReactElement, useEffect, useState } from "react";
import TableHOC from "../components/admin/TableHOC";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../types/reducer-types";
import { useDeleteOrderMutation, useMyOrdersQuery } from "../redux/api/cart";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

type DataType = {
  _id: string;
  amount: number;
  quantity: number;
  discount: number;
  status: ReactElement;
  action: ReactElement;
};

const column: Column<DataType>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Orders = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer
  );
  const { isLoading, data, isError, error } = useMyOrdersQuery(user?._id!);
  const [rows, setRows] = useState<DataType[]>([]);
  if (isError) {
    toast.error("Can't Fetch Orders");
  }
  const [deleteOrder] = useDeleteOrderMutation();

  useEffect(() => {
    if (data)
      setRows(
        data.orders.map((i) => ({
          _id: i._id,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={
                i.status === "Processing"
                  ? "red"
                  : i.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {i.status}
            </span>
          ),
          action: (
            <button
              onClick={async () => {
                await deleteOrder({
                  userId: user?._id!,
                  orderId: i._id!,
                });
              }}
            >
              <FaTrash />
            </button>
          ),
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    column,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();
  return (
    <div className="container">
      <h1>My Orders</h1>
      {Table}
    </div>
  );
};

export default Orders;
