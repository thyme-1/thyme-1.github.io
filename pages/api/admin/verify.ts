import type { NextApiRequest, NextApiResponse } from "next";

type VerifyResponse = { ok: boolean; error?: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res
      .status(500)
      .json({ ok: false, error: "ADMIN_PASSWORD is not set" });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const ok = password.length > 0 && password === configured;
  return res.status(ok ? 200 : 401).json({ ok });
}

