import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingLayout from "@/layouts/LandingLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
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

import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Routes with Sidebar/Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/feed" element={<MarketplaceFeed />} />
            <Route path="/feed/product/:id" element={<ProductDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/coins" element={<AdminCoinsPage />} />
            <Route path="/dashboard/stores" element={<AdminStoresPage />} />
            <Route path="/dashboard/products" element={<DashboardProductsPage />} />
            <Route path="/dashboard/mint" element={<MintConfirmPage />} />
            <Route path="/dashboard/stores/:id/products" element={<StoreProductsPage />} />
            <Route path="/dashboard/products/transfer/:productId" element={<ProductTransferPage />} />
            <Route path="/economy" element={<EconomyManagementPage />} />
            <Route path="/dashboard/rewards" element={<AdminRewardsPage />} />
            <Route path="/dashboard/rewards/claim" element={<ClaimRewardPage />} />
            <Route path="/dashboard/scan" element={<QRScannerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}

export default App
