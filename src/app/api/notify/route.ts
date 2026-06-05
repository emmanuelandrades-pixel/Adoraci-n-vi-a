import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { title, body, url } = await request.json();

  if (!title) return Response.json({ error: "title requerido" }, { status: 400 });

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, subscription");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const payload = JSON.stringify({ title, body: body ?? "", url: url ?? "/eventos" });
  const resultados = await Promise.allSettled(
    (subs ?? []).map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload);
      } catch (err: unknown) {
        // Suscripción expirada o inválida — eliminarla
        if (
          typeof err === "object" && err !== null &&
          "statusCode" in err && (err.statusCode === 410 || err.statusCode === 404)
        ) {
          await supabase.from("push_subscriptions").delete().eq("id", row.id);
        }
      }
    })
  );

  const enviadas = resultados.filter((r) => r.status === "fulfilled").length;
  return Response.json({ ok: true, enviadas });
}
