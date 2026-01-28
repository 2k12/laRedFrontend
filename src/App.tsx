import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingLayout from "@/layouts/LandingLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MarketplaceFeed from "@/pages/MarketplaceFeed";
import DashboardPage from "@/pages/DashboardPage";

import AdminCoinsPage from "@/pages/AdminCoinsPage";
import AdminStoresPage from "@/pages/AdminStoresPage";
import DashboardProductsPage from "@/pages/DashboardProductsPage";
import MintConfirmPage from "@/pages/MintConfirmPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import StoreProductsPage from "@/pages/StoreProductsPage";
import ProductTransferPage from "@/pages/ProductTransferPage";
import EconomyManagementPage from "@/pages/EconomyManagementPage";
import AdminRewardsPage from "@/pages/AdminRewardsPage";
import ClaimRewardPage from "@/pages/ClaimRewardPage";
import QRScannerPage from "@/pages/QRScannerPage";
import OrdersPage from "@/pages/OrdersPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "@/components/ui/sonner";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Authenticated Routes with Sidebar/Layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/feed" element={<MarketplaceFeed />} />
            <Route path="/feed/product/:id" element={<ProductDetailPage />} />

            {/* Dashboard Sub-routes */}
            <Route path="/dashboard">
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="coins" element={<AdminCoinsPage />} />
              <Route path="stores" element={<AdminStoresPage />} />
              <Route path="products" element={<DashboardProductsPage />} />
              <Route path="mint" element={<MintConfirmPage />} />
              <Route path="stores/:id/products" element={<StoreProductsPage />} />
              <Route path="products/transfer/:productId" element={<ProductTransferPage />} />
              <Route path="rewards" element={<AdminRewardsPage />} />
              <Route path="rewards/claim" element={<ClaimRewardPage />} />
              <Route path="scan" element={<QRScannerPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>

            <Route path="/economy" element={<EconomyManagementPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}

export default App
