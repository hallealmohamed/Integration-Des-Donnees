import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

export async function GET() {
  const session = driver.session();
  const result = await session.run(`
    MATCH (c:Client)-[:PASSE]->(co:Commande)-[:DETAIL]->(p:Produit)
    RETURN c, co, p
  `);
  const data = result.records.map((record) => ({
    client: record.get('c').properties,
    commande: record.get('co').properties,
    produit: record.get('p').properties,
  }));
  await session.close();
  return NextResponse.json(data);
}