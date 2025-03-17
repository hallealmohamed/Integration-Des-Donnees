import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const { query } = req.body as { query: string };

    // Validate that the query starts with "@"
    if (!query.startsWith("@")) {
      res.status(400).json({ message: "Query must start with '@'." });
      return;
    }

    // Save the query and generate a result (mocked here)
    const result = `Result for query: ${query}`;
    const savedQuery = await prisma.query.create({
      data: {
        content: query,
        result,
      },
    });

    res.status(200).json({ results: savedQuery.result });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
