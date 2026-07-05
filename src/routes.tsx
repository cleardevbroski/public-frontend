import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/RootLayout";
import Home from "@/pages/Home";
import Account from "@/pages/Account";
import Dealers from "@/pages/Dealers";
import PostProperty from "@/pages/PostProperty";
import Admin from "@/pages/Admin";
import AdminHero from "@/pages/AdminHero";
import AdminPost from "@/pages/AdminPost";
import Property from "@/pages/Property";
import Dealer from "@/pages/Dealer";
import Builder from "@/pages/Builder";
import Bangalore from "@/pages/Bangalore";

import AdminDealers from "@/pages/admin/AdminDealers";
import AdminBuilders from "@/pages/admin/AdminBuilders";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/account", element: <Account /> },
      { path: "/dealers", element: <Dealers /> },
      { path: "/postproperty", element: <PostProperty /> },
      { path: "/admin", element: <Admin /> },
      { path: "/admin/hero", element: <AdminHero /> },
      { path: "/admin/post", element: <AdminPost /> },
      { path: "/admin/dealers", element: <AdminDealers /> },
      { path: "/admin/builders", element: <AdminBuilders /> },
      { path: "/admin/leads", element: <AdminLeads /> },
      { path: "/admin/analytics", element: <AdminAnalytics /> },
      { path: "/property/:id", element: <Property /> },
      { path: "/dealer/:slug", element: <Dealer /> },
      { path: "/builder/:slug", element: <Builder /> },
      { path: "*", element: <Bangalore /> },
    ],
  },
]);
