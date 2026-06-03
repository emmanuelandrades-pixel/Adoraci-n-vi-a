import { ModoEnsayo } from "@/components/canciones/ModoEnsayo";

export default function EnsayoPage({ params }: { params: { id: string } }) {
  return <ModoEnsayo id={params.id} />;
}
