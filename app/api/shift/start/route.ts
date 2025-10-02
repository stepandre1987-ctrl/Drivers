export const runtime = "nodejs";

import { auth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  odoStart: z.number().int().nonnegative().optional(),
  note: z.string().max(500).optional()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  let json: unknown = {};
  try { json = await req.json(); } catch {}

  const parsed = Body.safeParse(json);
  if (!parsed.success) return new Response("Bad Request", { status: 400 });

  const alreadyOpen = await prisma.shift.findFirst({
    where: { userId, endedAt: null }
  });
  if (alreadyOpen) return new Response("Shift already running", { status: 400 });

  const shift = await prisma.shift.create({
    data: {
      userId,
      startedAt: new Date(),
      odoStart: parsed.data.odoStart ?? null,
      note: parsed.data.note ?? null
    }
  });

  return Response.json({ ok: true, shift });
}
