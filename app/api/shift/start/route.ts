export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server-auth"; // << sem
import { prisma } from "@/lib/prisma";
import { z } from "zod";
// ...zbytek beze změny
