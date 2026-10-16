"use client";

import { use } from "react";
import { OrderMaterialDetailPage } from "@/components/order-material-detail-page";

export default function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <OrderMaterialDetailPage orderId={resolvedParams.id} isNew={false} />;
}
