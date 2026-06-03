import { VisorCancion } from "@/components/canciones/VisorCancion";

export default function CancionPage({ params }: { params: { id: string } }) {
  return <VisorCancion id={params.id} />;
}
