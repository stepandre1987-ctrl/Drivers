import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  odoStart: z.number().int().nonnegative().optional(),
  note: z.string().max(500).optional()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const json = await req.json().catch(() => ({}));
  const body = Body.safeParse(json);
  if (!body.success) return new Response("Bad Request", { status: 400 });

  const open = await prisma.shift.findFirst({ where: { userId, endedAt: null } });
  if (open) return new Response("Shift already running", { status: 400 });

  const shift = await prisma.shift.create({
    data: {
      userId,
      startedAt: new Date(),
      odoStart: body.data.odoStart ?? null,
      note: body.data.note ?? null
    }
  });
  return Response.json({ ok: true, shift });
}
