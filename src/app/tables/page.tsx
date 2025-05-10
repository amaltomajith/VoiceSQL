"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import {
  Database,
  Table as TableIcon,
  ArrowLeft,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

export default function TablesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // In a real implementation, we would fetch tables from the database
    // For now, we'll simulate with mock data
    setTimeout(() => {
      setTables([
        {
          name: "employees",
          rowCount: 523,
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR", isPrimary: false },
            { name: "age", type: "INTEGER", isPrimary: false },
            { name: "email", type: "VARCHAR", isPrimary: false },
            { name: "salary", type: "DECIMAL", isPrimary: false },
            { name: "department", type: "VARCHAR", isPrimary: false },
            { name: "hire_date", type: "DATE", isPrimary: false },
          ],
          createdAt: "2023-10-15",
        },
        {
          name: "products",
          rowCount: 187,
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR", isPrimary: false },
            { name: "price", type: "DECIMAL", isPrimary: false },
            { name: "category", type: "VARCHAR", isPrimary: false },
            { name: "stock", type: "INTEGER", isPrimary: false },
            { name: "created_at", type: "TIMESTAMP", isPrimary: false },
          ],
          createdAt: "2023-11-02",
        },
        {
          name: "customers",
          rowCount: 842,
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "first_name", type: "VARCHAR", isPrimary: false },
            { name: "last_name", type: "VARCHAR", isPrimary: false },
            { name: "email", type: "VARCHAR", isPrimary: false },
            { name: "phone", type: "VARCHAR", isPrimary: false },
            { name: "address", type: "VARCHAR", isPrimary: false },
            { name: "created_at", type: "TIMESTAMP", isPrimary: false },
          ],
          createdAt: "2023-09-28",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <div className="container">
        <Navbar />
        <main>
          <header style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                onClick={() => router.back()}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 style={{ fontSize: "40px", fontWeight: 600 }}>
                Database Tables
              </h1>
            </div>
            <p style={{ marginTop: "10px", color: "#ababab" }}>
              View and manage all your database tables
            </p>
          </header>

          <div style={{ marginTop: "40px" }}>
            {isLoading ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "50px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #333",
                      borderTopColor: "#ff004f",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                </div>
                <p>Loading tables...</p>
              </div>
            ) : tables.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "50px" }}
              >
                <Database
                  size={50}
                  style={{ marginBottom: "20px", opacity: 0.5 }}
                />
                <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  No Tables Found
                </h3>
                <p style={{ marginBottom: "20px" }}>
                  Upload a file to create your first database table
                </p>
                <button onClick={() => router.push("/query")} className="btn">
                  Upload File
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() => router.push("/query")}
                    className="btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Database size={16} />
                    Create New Table
                  </button>
                </div>

                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="card"
                    style={{ marginBottom: "20px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "24px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <TableIcon size={20} />
                        {table.name}
                      </h3>
                      <div style={{ color: "#ababab", fontSize: "14px" }}>
                        {table.rowCount} rows • Created on {table.createdAt}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#1a1a1a",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Schema:
                      </h4>
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 12px",
                                  borderBottom: "1px solid #333",
                                }}
                              >
                                Column
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 12px",
                                  borderBottom: "1px solid #333",
                                }}
                              >
                                Type
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 12px",
                                  borderBottom: "1px solid #333",
                                }}
                              >
                                Constraints
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.columns.map((col: any) => (
                              <tr key={col.name}>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid #333",
                                  }}
                                >
                                  {col.name}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid #333",
                                  }}
                                >
                                  {col.type}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid #333",
                                  }}
                                >
                                  {col.isPrimary ? "PRIMARY KEY" : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => router.push(`/tables/${table.name}`)}
                        className="btn"
                        style={{
                          background: "transparent",
                          border: "1px solid #555",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: 0,
                        }}
                      >
                        <Eye size={16} />
                        View Data
                      </button>
                      <button
                        onClick={() =>
                          alert(`Edit ${table.name} (Not implemented)`)
                        }
                        className="btn"
                        style={{
                          background: "transparent",
                          border: "1px solid #555",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: 0,
                        }}
                      >
                        <Edit size={16} />
                        Edit Schema
                      </button>
                      <button
                        onClick={() =>
                          alert(`Delete ${table.name} (Not implemented)`)
                        }
                        className="btn"
                        style={{
                          background: "transparent",
                          border: "1px solid #ff004f",
                          color: "#ff004f",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: 0,
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
