import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const OfferList = React.lazy(() => import("./OfferList.jsx"));
const OfferDetails = React.lazy(() => import("./OfferDetails.jsx"));

const OfferRouter = () => {
  return (
    <Suspense fallback={<div className="p-4" role="status">Ładowanie...</div>}>
      <Routes>
        <Route index element={<OfferList />} />
        <Route path=":id" element={<OfferDetails />} />
      </Routes>
    </Suspense>
  );
};

export default OfferRouter;
