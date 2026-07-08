import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/RootLayout";
import Home from "@/pages/Home";

const Account = lazy(() => import("@/pages/Account"));
const Dealers = lazy(() => import("@/pages/Dealers"));
const PostProperty = lazy(() => import("@/pages/PostProperty"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminHero = lazy(() => import("@/pages/AdminHero"));
const AdminPost = lazy(() => import("@/pages/AdminPost"));
const Property = lazy(() => import("@/pages/Property"));
const Dealer = lazy(() => import("@/pages/Dealer"));
const Builder = lazy(() => import("@/pages/Builder"));
const Bangalore = lazy(() => import("@/pages/Bangalore"));

const AdminDealers = lazy(() => import("@/pages/admin/AdminDealers"));
const AdminBuilders = lazy(() => import("@/pages/admin/AdminBuilders"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminLawyers = lazy(() => import("@/pages/admin/AdminLawyers"));
const AdminInsights = lazy(() => import("@/pages/admin/AdminInsights"));

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
      { path: "/admin/testimonials", element: <AdminTestimonials /> },
      { path: "/admin/lawyers", element: <AdminLawyers /> },
      { path: "/admin/insights", element: <AdminInsights /> },
      { path: "/property/:id", element: <Property /> },
      { path: "/dealer/:slug", element: <Dealer /> },
      { path: "/builder/:slug", element: <Builder /> },
      { path: "*", element: <Bangalore /> },
    ],
  },
]);
