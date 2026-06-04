import { VisorCancion } from "@/components/canciones/VisorCancion";

export default async function CancionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VisorCancion id={id} />;
}
