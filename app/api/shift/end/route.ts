import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { appendShiftToSheet } from "@/lib/googleSheets";

const Body = z.object({
  odoEnd: z.number().int().nonnegative().optional(),
  note: z.string().max(500).optional()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const json = await req.json().catch(() => ({}));
  const body = Body.safeParse(json);
  if (!body.success) return new Response("Bad Request", { status: 400 });

  const open = await prisma.shift.findFirst({ where: { userId, endedAt: null }, orderBy: { startedAt: "desc" } });
  if (!open) return new Response("No open shift", { status: 400 });

  const odoEnd = body.data.odoEnd ?? null;
  const kms = open.odoStart != null && odoEnd != null ? Math.max(0, odoEnd - open.odoStart) : null;

  const ended = await prisma.shift.update({
    where: { id: open.id },
    data: { endedAt: new Date(), odoEnd, kms, note: body.data.note ?? open.note }
  });

  await appendShiftToSheet(ended.id); // zapíše řádek do Google Sheets

  return Response.json({ ok: true, shift: ended });
}
