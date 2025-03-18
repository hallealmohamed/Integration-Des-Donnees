import { NextResponse } from 'next/server';
import fs from 'fs';
import { parseStringPromise } from 'xml2js';

export async function GET() {
  const xmlData = fs.readFileSync('./public/data.xml', 'utf-8');
  const result = await parseStringPromise(xmlData);
  return NextResponse.json(result);
}