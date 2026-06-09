import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TIPO_RECORDATORIO = "recordatorio_24h";

const DIAS_ES: Record<number, string> = {
  0: "domingo", 1: "lunes", 2: "martes", 3: "miércoles",
  4: "jueves", 5: "viernes", 6: "sábado",
};

export async function GET(request: Request) {
  // Verificar que la llamada viene de Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  // Ventana: entre 23h y 25h desde ahora
  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
  const hasta = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

  // Cargar todos los eventos
  const { data: rows, error } = await supabase
    .from("eventos")
    .select("id, data");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const eventos = (rows ?? []).map((r) => ({ id: r.id, ...r.data })) as Array<{
    id: string; nombre: string; fecha: string; hora: string;
    lugar?: string; tipo: string; estado: string;
  }>;

  // Filtrar eventos que ocurren en la ventana de 24h y no están cancelados
  const proximos = eventos.filter((e) => {
    if (e.estado === "cancelado") return false;
    const dt = new Date(`${e.fecha}T${e.hora || "00:00"}:00`);
    return dt >= desde && dt <= hasta;
  });

  if (proximos.length === 0) {
    return Response.json({ ok: true, enviados: 0, mensaje: "Sin eventos próximos" });
  }

  // Suscriptores push
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, subscription");

  let enviados = 0;

  for (const evento of proximos) {
    // Verificar si ya se envió el recordatorio para este evento
    const { data: yaEnviado } = await supabase
      .from("notificaciones_log")
      .select("id")
      .eq("evento_id", evento.id)
      .eq("tipo", TIPO_RECORDATORIO)
      .maybeSingle();

    if (yaEnviado) continue;

    // Formatear fecha
    const dt = new Date(`${evento.fecha}T${evento.hora || "00:00"}:00`);
    const dia = DIAS_ES[dt.getDay()] ?? "";
    const horaFmt = evento.hora ?? "";
    const lugar = evento.lugar ? ` · ${evento.lugar}` : "";

    const tipo = evento.tipo === "ensayo" ? "🎸 Ensayo mañana"
      : evento.tipo === "culto" ? "🙏 Culto mañana"
      : evento.tipo === "especial" ? "✨ Evento especial mañana"
      : "📅 Evento mañana";

    const payload = JSON.stringify({
      title: `${tipo}: ${evento.nombre}`,
      body: `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${horaFmt}${lugar}`,
      url: "/eventos",
    });

    // Enviar a todos los suscriptores
    await Promise.allSettled(
      (subs ?? []).map(async (row) => {
        try {
          await webpush.sendNotification(row.subscription, payload);
        } catch (err: unknown) {
          if (
            typeof err === "object" && err !== null && "statusCode" in err &&
            (err.statusCode === 410 || err.statusCode === 404)
          ) {
            await supabase.from("push_subscriptions").delete().eq("id", row.id);
          }
        }
      })
    );

    // Registrar que ya se envió
    await supabase
      .from("notificaciones_log")
      .insert({ evento_id: evento.id, tipo: TIPO_RECORDATORIO });

    enviados++;
  }

  return Response.json({ ok: true, enviados });
}
