import { Router } from "express";
import { z } from "zod";
import { db, partnerApplications } from "@workspace/db";
import { sendPartnerApplicationEmail } from "../lib/mailer";

const router = Router();

const partnerApplicationSchema = z.object({
  channelName: z.string().trim().min(2).max(80),
  platform: z.enum(["twitch", "youtube", "kick", "other"]),
  channelUrl: z.string().trim().url().max(300).refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }),
  avgViewers: z.union([z.string(), z.number()]).transform(String).pipe(z.string().trim().min(1).max(30)),
  schedule: z.string().trim().min(2).max(300),
  motivation: z.string().trim().min(10).max(2000),
  discordTag: z.string().trim().min(2).max(80),
});

router.post("/partners/apply", async (req, res) => {
  const parsed = partnerApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }
  const { channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag } = parsed.data;
  try {
    const [app] = await db
      .insert(partnerApplications)
      .values({ channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag })
      .returning();

    void sendPartnerApplicationEmail({ channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag })
      .then(() => req.log.info({ channelName }, "Partner application e-mail sent"))
      .catch((err) => req.log.error({ err, channelName }, "Failed to send partner application e-mail"));

    return res.status(201).json({ message: "Candidatura enviada com sucesso!", id: app.id });
  } catch (err) {
    req.log.error(err, "Error submitting partner application");
    return res.status(500).json({ error: "Erro ao enviar candidatura." });
  }
});

export default router;
