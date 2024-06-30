import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import {
  calculatePercentage,
  getInventory,
  prevMonthsData,
} from "../utils/features.js";
import { count } from "console";
import { getAllOrders } from "./order.js";

export const getDashboardStatistics = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let stats;
    if (nodeCache.has("admin-stats"))
      stats = JSON.parse(nodeCache.get("admin-stats") as string);
    else {
      const currentDate = new Date();

      // get current month and previous month date

      const currentMonth = {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: currentDate,
      };
      const prevMonth = {
        start: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        ),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 0),
      };

      // get current month and preceeding month's data

      const currentMonthProductsPromise = Product.find({
        createdAt: {
          $gte: currentMonth.start,
          $lte: currentMonth.end,
        },
      });
      const prevMonthProductsPromise = Product.find({
        createdAt: {
          $gte: prevMonth.start,
          $lte: prevMonth.end,
        },
      });
      const currentMonthUsersPromise = User.find({
        createdAt: {
          $gte: currentMonth.start,
          $lte: currentMonth.end,
        },
      });
      const prevMonthUsersPromise = User.find({
        createdAt: {
          $gte: prevMonth.start,
          $lte: prevMonth.end,
        },
      });
      const currentMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: currentMonth.start,
          $lte: currentMonth.end,
        },
      });
      const prevMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: prevMonth.start,
          $lte: prevMonth.end,
        },
      });

      // get previous six months data

      const prevSixMonth = new Date();
      prevSixMonth.setMonth(prevSixMonth.getMonth() - 6);
      const prevSixMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: prevSixMonth,
          $lte: currentMonth.end,
        },
      });

      // get latest 4 transactions

      const latestTransactionsPromise = Order.find({})
        .select(["orderItems", "discount", "total", "status"])
        .sort({ createdAt: -1 })
        .limit(4);

      // resolve all the promises

      const [
        currentMonthProducts,
        currentMonthUsers,
        currentMonthOrders,
        prevMonthProducts,
        prevMonthUsers,
        prevMonthOrders,
        productCount,
        userCount,
        allOrders,
        prevSixMonthOrders,
        productCategories,
        femaleUserCount,
        latestTransactions,
      ] = await Promise.all([
        currentMonthProductsPromise,
        currentMonthUsersPromise,
        currentMonthOrdersPromise,
        prevMonthProductsPromise,
        prevMonthUsersPromise,
        prevMonthOrdersPromise,
        Product.countDocuments(),
        User.countDocuments(),
        Order.find({}).select("total"),
        prevSixMonthOrdersPromise,
        Product.distinct("category"),
        User.countDocuments({ gender: "female" }),
        latestTransactionsPromise,
      ]);

      // calculate relative percentage of previous month and current month

      const deltaUsers = calculatePercentage(
        currentMonthUsers.length,
        prevMonthUsers.length
      );
      const deltaProducts = calculatePercentage(
        currentMonthProducts.length,
        prevMonthProducts.length
      );
      const deltaOrders = calculatePercentage(
        currentMonthOrders.length,
        prevMonthOrders.length
      );
      const currentMonthRevenue = currentMonthOrders.reduce(
        (revenue, order) => revenue + (order.total || 0),
        0
      );
      const prevMonthRevenue = prevMonthOrders.reduce(
        (revenue, order) => revenue + (order.total || 0),
        0
      );
      const deltaRevenue = calculatePercentage(
        currentMonthRevenue,
        prevMonthRevenue
      );
      const revenue = allOrders.reduce(
        (revenue, order) => revenue + (order.total || 0),
        0
      );

      // previous 6 months data for chart

      const orderMonthCount = prevMonthsData(
        6,
        prevSixMonthOrders,
        currentDate
      );

      const orderMonthlyRevenue = prevMonthsData(
        6,
        prevSixMonthOrders,
        currentDate,
        "total"
      );

      // get category data

      const categoryData = await getInventory(productCategories, productCount);

      // get gender details

      const genderRatio = {
        male: (userCount - femaleUserCount) / userCount,
        female: femaleUserCount / userCount,
      };

      // modified latest transactions

      const modifiedLatestTransactions = latestTransactions.map(
        (transaction) => ({
          _id: transaction._id,
          discount: transaction.discount,
          amount: transaction.total,
          quantity: transaction.orderItems.length,
          status: transaction.status,
        })
      );

      // objects which is then attached to the response object

      const percentChange = {
        deltaRevenue,
        deltaProducts,
        deltaUsers,
        deltaOrders,
      };
      const count = {
        user: userCount,
        product: productCount,
        order: allOrders.length,
        revenue,
      };
      const charts = {
        orderMonthCount,
        orderMonthlyRevenue,
      };
      stats = {
        categoryData,
        percentChange,
        count,
        charts,
        genderRatio,
        latestTransactions: modifiedLatestTransactions,
      };
      nodeCache.set("admin-stats", JSON.stringify(stats));
    }

    return res.status(200).json({
      success: true,
      stats,
    });
  }
);

export const getPieChart = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let charts;
    if (nodeCache.has("admin-pie-charts"))
      charts = JSON.parse(nodeCache.get("admin-pie-charts") as string);
    else {
      const getOrderDetailsPromise = Order.find({}).select([
        "subtotal",
        "tax",
        "shippingCharges",
        "discount",
        "total",
      ]);
      const [
        countProcessing,
        countShipped,
        countDelivered,
        productCategories,
        productCount,
        outOfStockProducts,
        getOrderDetails,
        getUserDOB,
        getAdminCount,
        getUserCount,
      ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        getOrderDetailsPromise,
        User.find({}).select(["dob"]),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
      ]);
      const orderFullfillmentRatio = {
        processing: countProcessing,
        shipped: countShipped,
        delivered: countDelivered,
      };

      // get category data

      const productCategoryRatio = await getInventory(
        productCategories,
        productCount
      );

      // get stock availability

      const getStockAvailability = {
        inStock: productCount - outOfStockProducts,
        outOfStock: outOfStockProducts,
      };

      // get data for revenue distribution

      const grossIncome = getOrderDetails.reduce(
        (total, detail) => total + (detail.total || 0),
        0
      );
      const totalDiscount = getOrderDetails.reduce(
        (total, detail) => total + (detail.discount || 0),
        0
      );
      const productionCost = getOrderDetails.reduce(
        (total, detail) => total + (detail.shippingCharges || 0),
        0
      );
      const totalBurn = getOrderDetails.reduce(
        (total, detail) => total + (detail.tax || 0),
        0
      );
      const marketingCost = grossIncome * (30 / 100); // static cost (30%)
      const netMargin =
        grossIncome -
        (totalDiscount + productionCost + totalBurn + marketingCost);

      // revenue distribution object

      const renvenueDistribution = {
        netMargin,
        discount: totalDiscount,
        productionCost,
        burn: totalBurn,
        marketingCost,
      };

      // get age distriution

      const userAgeGroup = {
        Teen: getUserDOB.filter((user) => user.age >= 13 && user.age <= 18)
          .length,
        Adults: getUserDOB.filter((user) => user.age >= 18 && user.age <= 65)
          .length,
        Elderly: getUserDOB.filter((user) => user.age > 60).length,
      };

      // get user traffic

      const userTraffic = {
        admin: getAdminCount,
        customers: getUserCount,
      };

      charts = {
        orderFullfillmentRatio,
        productCategoryRatio,
        getStockAvailability,
        renvenueDistribution,
        userAgeGroup,
        userTraffic,
      };
      nodeCache.set("admin-pie-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
      success: true,
      charts,
    });
  }
);

export const getBarChart = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let charts;
    if (nodeCache.has("admin-bar-charts"))
      charts = JSON.parse(nodeCache.get("admin-bar-charts") as string);
    else {
      const currentDate = new Date();
      const prevSixMonth = new Date();
      prevSixMonth.setMonth(prevSixMonth.getMonth() - 6);
      const prevTwelveMonth = new Date();
      prevTwelveMonth.setMonth(prevTwelveMonth.getMonth() - 12);
      const prevSixMonthProductsPromise = Product.find({
        createdAt: {
          $gte: prevSixMonth,
          $lte: currentDate,
        },
      }).select("createdAt");
      const prevSixMonthUsersPromise = User.find({
        createdAt: {
          $gte: prevSixMonth,
          $lte: currentDate,
        },
      }).select("createdAt");
      const prevTwelveMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: prevTwelveMonth,
          $lte: currentDate,
        },
      }).select("createdAt");
      const [prevSixMonthProducts, prevSixMonthUsers, prevTwelveMonthOrders] =
        await Promise.all([
          prevSixMonthProductsPromise,
          prevSixMonthUsersPromise,
          prevTwelveMonthOrdersPromise,
        ]);
      const prevSixMonthProductCount = prevMonthsData(
        6,
        prevSixMonthProducts,
        currentDate
      );
      const prevSixMonthUserCount = prevMonthsData(
        6,
        prevSixMonthUsers,
        currentDate
      );
      const prevTwelveMonthOrderCount = prevMonthsData(
        12,
        prevTwelveMonthOrders,
        currentDate
      );
      charts = {
        users: prevSixMonthUserCount,
        products: prevSixMonthProductCount,
        orders: prevTwelveMonthOrderCount,
      };
      nodeCache.set("admin-bar-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
      success: true,
      charts,
    });
  }
);

export const getLineChart = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let charts;
    if (nodeCache.has("admin-line-charts"))
      charts = JSON.parse(nodeCache.get("admin-line-charts") as string);
    else {
      const currentDate = new Date();
      const prevTwelveMonth = new Date();
      prevTwelveMonth.setMonth(prevTwelveMonth.getMonth() - 12);
      const prevTwelveMonthProductsPromise = Product.find({
        createdAt: {
          $gte: prevTwelveMonth,
          $lte: currentDate,
        },
      }).select("createdAt");
      const prevTwelveMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: prevTwelveMonth,
          $lte: currentDate,
        },
      }).select(["createdAt", "discount", "total"]);
      const prevTwelveMonthUsersPromise = User.find({
        createdAt: {
          $gte: prevTwelveMonth,
          $lte: currentDate,
        },
      }).select("createdAt");
      const [
        prevTwelveMonthProducts,
        prevTwelveMonthOrders,
        prevTwelveMonthUsers,
      ] = await Promise.all([
        prevTwelveMonthProductsPromise,
        prevTwelveMonthOrdersPromise,
        prevTwelveMonthUsersPromise,
      ]);
      const discount = prevMonthsData(
        12,
        prevTwelveMonthOrders,
        currentDate,
        "discount"
      );
      const revenue = prevMonthsData(
        12,
        prevTwelveMonthOrders,
        currentDate,
        "total"
      );
      const prevTwelveMonthProductCount = prevMonthsData(
        12,
        prevTwelveMonthProducts,
        currentDate
      );
      const prevTwelveMonthUserCount = prevMonthsData(
        12,
        prevTwelveMonthUsers,
        currentDate
      );
      charts = {
        products: prevTwelveMonthProductCount,
        users: prevTwelveMonthUserCount,
        discount,
        revenue,
      };
      nodeCache.set("admin-line-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
      success: true,
      charts,
    });
  }
);
