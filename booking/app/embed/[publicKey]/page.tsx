import { BookingWidget } from "@/components/booking-widget";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ publicKey: string }>;
}) {
  const { publicKey } = await params;
  return (
    <div className="min-h-dvh bg-transparent p-2">
      <BookingWidget publicKey={publicKey} framed />
    </div>
  );
}
