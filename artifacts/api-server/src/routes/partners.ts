import { Router } from "express";
import { db, partnerApplications } from "@workspace/db";
import { sendPartnerApplicationEmail } from "../lib/mailer";

const router = Router();

router.post("/partners/apply", async (req, res) => {
  const { channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag } = req.body;
  if (!channelName || !platform || !channelUrl || !avgViewers || !schedule || !motivation || !discordTag) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }
  try {
    const [app] = await db
      .insert(partnerApplications)
      .values({ channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag })
      .returning();

    req.log.info({ channelName }, "Sending partner application e-mail");
    await sendPartnerApplicationEmail({ channelName, platform, channelUrl, avgViewers, schedule, motivation, discordTag });
    req.log.info({ channelName }, "Partner application e-mail sent");

    return res.status(201).json({ message: "Candidatura enviada com sucesso!", id: app.id });
  } catch (err) {
    req.log.error(err, "Error submitting partner application");
    return res.status(500).json({ error: "Erro ao enviar candidatura." });
  }
});

export default router;
