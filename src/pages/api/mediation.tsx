import { NextResponse } from 'next/server';

// Fonctions de mapping
const mapSqlToGlobal = (sqlData: any) => {
  return sqlData.map((client: any) => ({
    id: `sql-${client.id_client}`,
    nom: client.nom_complet,
    adresse: client.adresse,
    email: client.email_contact,
    telephone: client.numero_telephone,
    commandes: client.Commandes.map((commande: any) => ({
      id: `sql-${commande.id_commande}`,
      date: commande.date_commande.toISOString(),
      montant: parseFloat(commande.montant.toString()),
      statut: commande.statut,
      mode_paiement: commande.mode_paiement,
      produits: commande.Details.map((detail: any) => ({
        id: `sql-${detail.id_produit}`,
        description: detail.produit.description,
        prix: detail.produit.prix_cout,
        categorie: detail.produit.categorie,
        fournisseur: {
          id: `sql-${detail.produit.Approvisionnement[0].id_fournisseur}`,
          nom: detail.produit.Approvisionnement[0].fournisseur.nom_fournisseur,
          telephone: detail.produit.Approvisionnement[0].fournisseur.numero_telephone,
          adresse: detail.produit.Approvisionnement[0].fournisseur.adresse,
        },
      })),
      facture: commande.Facture
        ? {
            id: `sql-${commande.Facture.id_facture}`,
            montant_total: parseFloat(commande.Facture.montant_total.toString()),
            date: commande.Facture.date_facture.toISOString(),
          }
        : undefined,
      livraison: commande.Livraison
        ? {
            id: `sql-${commande.Livraison.id_livraison}`,
            transporteur: commande.Livraison.transporteur,
            date_estimee: commande.Livraison.date_estimee.toISOString(),
            statut: commande.Livraison.statut,
          }
        : undefined,
    })),
  }));
};

const mapXmlToGlobal = (xmlData: any) => {
  return xmlData.Vente.clients[0].client.map((client: any) => ({
    id: `xml-${client.$.id}`,
    nom: client.nom[0],
    adresse: client.adresse?.[0] || '',
    email: client.courriel[0],
    telephone: client.telephone?.[0] || '',
    commandes: xmlData.Vente.commandes[0].commande
      .filter((commande: any) => commande.$.clientID === client.$.id)
      .map((commande: any) => ({
        id: `xml-${commande.$.id}`,
        date: commande.date[0],
        montant: parseFloat(commande.montant[0]),
        statut: commande.statut[0],
        mode_paiement: commande.mode_paiement[0],
        produits: xmlData.Vente.produits[0].produit
          .filter((produit: any) => produit.$.id === commande.$.id_produit)
          .map((produit: any) => ({
            id: `xml-${produit.$.id}`,
            description: produit.description[0],
            prix: parseFloat(produit.prix[0]),
            categorie: produit.categorie[0],
            fournisseur: {
              id: `xml-${produit.$.id_fournisseur}`,
              nom: xmlData.Vente.fournisseurs[0].fournisseur.find(
                (f: any) => f.$.id === produit.$.id_fournisseur
              ).nom[0],
              telephone: xmlData.Vente.fournisseurs[0].fournisseur.find(
                (f: any) => f.$.id === produit.$.id_fournisseur
              ).telephone[0],
              adresse: xmlData.Vente.fournisseurs[0].fournisseur.find(
                (f: any) => f.$.id === produit.$.id_fournisseur
              ).adresse[0],
            },
          })),
        facture: xmlData.Vente.factures[0].facture
          .find((f: any) => f.$.commandeID === commande.$.id)
          ? {
              id: `xml-${f.$.id}`,
              montant_total: parseFloat(f.montant[0]),
              date: f.date[0],
            }
          : undefined,
        livraison: xmlData.Vente.livraisons[0].livraison
          .find((l: any) => l.$.commandeID === commande.$.id)
          ? {
              id: `xml-${l.$.id}`,
              transporteur: l.transporteur[0],
              date_estimee: l.date_estimee[0],
              statut: l.statut[0],
            }
          : undefined,
      })),
  }));
};

const mapNeo4jToGlobal = (neo4jData: any) => {
  const clientsMap = new Map<string, any>();

  neo4jData.forEach((record: any) => {
    const client = record.client.properties;
    const commande = record.commande.properties;
    const produit = record.produit.properties;

    if (!clientsMap.has(client.id_client)) {
      clientsMap.set(client.id_client, {
        id: `neo4j-${client.id_client}`,
        nom: client.nom,
        adresse: client.adresse,
        email: client.email,
        telephone: client.telephone,
        commandes: [],
      });
    }

    const existingClient = clientsMap.get(client.id_client)!;
    const existingCommande = existingClient.commandes.find(
      (c: any) => c.id === `neo4j-${commande.id_commande}`
    );

    if (!existingCommande) {
      existingClient.commandes.push({
        id: `neo4j-${commande.id_commande}`,
        date: commande.date,
        montant: parseFloat(commande.montant),
        statut: commande.statut,
        mode_paiement: commande.mode_paiement,
        produits: [{
          id: `neo4j-${produit.id_produit}`,
          description: produit.description,
          prix: parseFloat(produit.prix),
          categorie: produit.categorie,
          fournisseur: {
            id: `neo4j-${produit.id_fournisseur}`,
            nom: produit.fournisseur_nom,
            telephone: produit.fournisseur_telephone,
            adresse: produit.fournisseur_adresse,
          },
        }],
      });
    } else {
      existingCommande.produits.push({
        id: `neo4j-${produit.id_produit}`,
        description: produit.description,
        prix: parseFloat(produit.prix),
        categorie: produit.categorie,
        fournisseur: {
          id: `neo4j-${produit.id_fournisseur}`,
          nom: produit.fournisseur_nom,
          telephone: produit.fournisseur_telephone,
          adresse: produit.fournisseur_adresse,
        },
      });
    }
  });

  return Array.from(clientsMap.values());
};

export async function GET() {
  const [sqlResponse, xmlResponse, neo4jResponse] = await Promise.all([
    fetch('http://localhost:3000/api/sql'),
    fetch('http://localhost:3000/api/xml'),
    fetch('http://localhost:3000/api/neo4j'),
  ]);

  const sqlData = await sqlResponse.json();
  const xmlData = await xmlResponse.json();
  const neo4jData = await neo4jResponse.json();

  // Mapper les données locales vers le schéma global
  const globalData = [
    ...mapSqlToGlobal(sqlData),
    ...mapXmlToGlobal(xmlData),
    ...mapNeo4jToGlobal(neo4jData),
  ];

  return NextResponse.json(globalData);
}