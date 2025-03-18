"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState<boolean>(false);

  const handleQuerySubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const response = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data: { results: string } = await response.json();
    setResults(data.results || "No results found.");
  };

  const databaseSchema = [
    {
      table: "Clients",
      columns: ["id_client", "nom_complet", "adresse", "email_contact", "numero_telephone"],
    },
    {
      table: "Employes",
      columns: ["id_employe", "nom_complet", "email", "poste", "salaire", "agence_ref"],
    },
    {
      table: "Agences",
      columns: ["id_agence", "ville", "adresse", "responsable_ref"],
    },
    {
      table: "Fournisseurs",
      columns: ["id_fournisseur", "nom_fournisseur", "numero_telephone", "adresse"],
    },
    {
      table: "Produits",
      columns: ["id_produit", "description", "prix_cout", "categorie", "quantite_totale", "id_fournisseur"],
    },
    {
      table: "Commandes",
      columns: ["id_commande", "date_commande", "montant", "statut", "mode_paiement", "client_ref", "employe_ref"],
    },
    {
      table: "Details_Commande",
      columns: ["id_commande", "id_produit", "quantite"],
    },
    {
      table: "Factures",
      columns: ["id_facture", "montant_total", "date_facture", "commande_ref"],
    },
    {
      table: "Livraisons",
      columns: ["id_livraison", "transporteur", "date_estimee", "statut", "commande_ref"],
    },
    {
      table: "Approvisionnement",
      columns: ["id_produit", "id_fournisseur", "quantite"],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <form
        onSubmit={handleQuerySubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Submit Query
        </button>
      </form>
      {results && (
        <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-md">
          <h2 className="font-bold mb-2">Query Results:</h2>
          <p>{results}</p>
        </div>
      )}
      <button
        onClick={() => setShowSchema(!showSchema)}
        className="rounded-full border border-solid border-gray-300 transition-all duration-500 ease-in-out transform hover:scale-105 flex items-center justify-center bg-gray-800 text-white gap-2 hover:bg-gray-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        {showSchema ? "Hide Database Schema" : "Show Database Schema"}
      </button>
      {showSchema && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full transition-opacity duration-500 ease-in-out opacity-100">
          {databaseSchema.map((table) => (
            <div
              key={table.table}
              className="p-4 border border-gray-600 rounded shadow-md bg-gray-900 text-gray-200 transform transition-transform duration-500 ease-in-out hover:scale-105"
            >
              <h3 className="font-semibold text-lg mb-2 text-white">{table.table}</h3>
              <ul className="list-disc list-inside">
                {table.columns.map((column) => (
                  <li key={column} className="text-sm text-gray-400">
                    {column}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
