import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      Commandes: {
        include: {
          Details: {
            include: {
              produit: {
                include: {
                  Approvisionnement: {
                    include: {
                      fournisseur: true,
                    },
                  },
                },
              },
            },
          },
          Facture: true,
          Livraison: true,
        },
      },
    },
  });
  return NextResponse.json(clients);
}