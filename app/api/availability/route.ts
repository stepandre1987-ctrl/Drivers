import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  date: z.string(),
  status: z.enum(["OFF","PROJECT"]),
  project: z.string().max(100).optional()
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const json = await req.json().catch(() => ({}));
  const body = Body.safeParse(json);
  if (!body.success) return new Response("Bad Request", { status: 400 });

  const day = new Date(body.data.date);
  day.setHours(0,0,0,0);

  const rec = await prisma.availability.upsert({
    where: { userId_date: { userId, date: day } },
    update: { status: body.data.status as any, project: body.data.project ?? null },
    create: { userId, date: day, status: body.data.status as any, project: body.data.project ?? null }
  });

  return Response.json({ ok: true, availability: rec });
}
