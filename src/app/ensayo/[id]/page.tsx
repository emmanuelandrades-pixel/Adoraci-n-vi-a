import { ModoEnsayo } from "@/components/canciones/ModoEnsayo";

export default async function EnsayoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ModoEnsayo id={id} />;
}
