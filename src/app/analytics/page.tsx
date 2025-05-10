"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import {
  BarChart,
  PieChart,
  LineChart,
  ArrowLeft,
  Database,
} from "lucide-react";

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // In a real implementation, we would fetch tables from the database
    // For now, we'll simulate with mock data
    setTimeout(() => {
      const mockTables = [
        { name: "employees", rowCount: 523 },
        { name: "products", rowCount: 187 },
        { name: "customers", rowCount: 842 },
      ];
      setTables(mockTables);
      setSelectedTable(mockTables[0].name);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedTable) {
      // In a real implementation, we would fetch analytics for the selected table
      // For now, we'll simulate with mock data
      setIsLoading(true);
      setTimeout(() => {
        if (selectedTable === "employees") {
          setAnalytics({
            numericColumns: ["age", "salary", "years_of_service"],
            categoricalColumns: ["department", "position", "location"],
            summary: {
              totalRows: 523,
              medianAge: 35,
              medianSalary: 75000,
              averageYearsOfService: 4.7,
            },
            departmentDistribution: {
              Engineering: 180,
              Marketing: 95,
              Sales: 120,
              HR: 45,
              Finance: 83,
            },
            salaryRanges: {
              "<50K": 125,
              "50K-75K": 198,
              "75K-100K": 142,
              ">100K": 58,
            },
            ageGroups: {
              "20-30": 157,
              "31-40": 215,
              "41-50": 98,
              "51+": 53,
            },
          });
        } else if (selectedTable === "products") {
          setAnalytics({
            numericColumns: ["price", "stock", "rating"],
            categoricalColumns: ["category", "supplier", "status"],
            summary: {
              totalRows: 187,
              averagePrice: 129.99,
              totalStock: 4325,
              averageRating: 4.2,
            },
            categoryDistribution: {
              Electronics: 65,
              Clothing: 42,
              "Home & Kitchen": 38,
              Books: 22,
              Other: 20,
            },
            priceRanges: {
              "<$50": 45,
              "$50-$100": 62,
              "$100-$200": 48,
              ">$200": 32,
            },
            stockStatus: {
              "In Stock": 142,
              "Low Stock": 28,
              "Out of Stock": 17,
            },
          });
        } else if (selectedTable === "customers") {
          setAnalytics({
            numericColumns: ["orders", "total_spent", "account_age_days"],
            categoricalColumns: [
              "country",
              "membership_tier",
              "acquisition_source",
            ],
            summary: {
              totalRows: 842,
              averageOrders: 5.3,
              averageTotalSpent: 427.85,
              averageAccountAge: 187,
            },
            countryDistribution: {
              "United States": 425,
              Canada: 98,
              "United Kingdom": 87,
              Australia: 65,
              Germany: 58,
              Other: 109,
            },
            membershipTiers: {
              Bronze: 412,
              Silver: 285,
              Gold: 98,
              Platinum: 47,
            },
            acquisitionSources: {
              "Organic Search": 312,
              "Paid Ads": 245,
              Referral: 187,
              "Social Media": 98,
            },
          });
        }
        setIsLoading(false);
      }, 800);
    }
  }, [selectedTable]);

  const renderBarChart = (data: Record<string, number>, title: string) => {
    const maxValue = Math.max(...Object.values(data));
    return (
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ fontSize: "18px", marginBottom: "15px" }}>{title}</h4>
        <div
          style={{
            background: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          {Object.entries(data).map(([label, value]) => (
            <div key={label} style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div
                style={{
                  height: "12px",
                  background: "#333",
                  borderRadius: "6px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${(value / maxValue) * 100}%`,
                    background: "#ff004f",
                    borderRadius: "6px",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
                Data Analytics
              </h1>
            </div>
            <p style={{ marginTop: "10px", color: "#ababab" }}>
              Visualize and analyze your database tables
            </p>
          </header>

          <div style={{ marginTop: "40px" }}>
            {isLoading && !analytics ? (
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
                <p>Loading analytics...</p>
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
                <div className="card" style={{ marginBottom: "30px" }}>
                  <h3 style={{ fontSize: "20px", marginBottom: "15px" }}>
                    Select Table
                  </h3>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {tables.map((table) => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table.name)}
                        style={{
                          background:
                            selectedTable === table.name
                              ? "#ff004f"
                              : "transparent",
                          border: `1px solid ${selectedTable === table.name ? "#ff004f" : "#555"}`,
                          borderRadius: "6px",
                          padding: "10px 15px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Database size={16} />
                        {table.name}
                        <span
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "10px",
                            padding: "2px 8px",
                            fontSize: "12px",
                            marginLeft: "5px",
                          }}
                        >
                          {table.rowCount}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div
                    className="card"
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          border: "3px solid #333",
                          borderTopColor: "#ff004f",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                    </div>
                    <p>Loading analytics for {selectedTable}...</p>
                  </div>
                ) : analytics ? (
                  <>
                    <div className="card" style={{ marginBottom: "30px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <BarChart size={24} />
                        <h3 style={{ fontSize: "24px" }}>Summary Statistics</h3>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "20px",
                          marginBottom: "20px",
                        }}
                      >
                        {Object.entries(analytics.summary).map(
                          ([key, value]: [string, any]) => (
                            <div
                              key={key}
                              style={{
                                background: "#1a1a1a",
                                padding: "15px",
                                borderRadius: "8px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#ababab",
                                  fontSize: "14px",
                                  marginBottom: "5px",
                                }}
                              >
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/_/g, " ")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </div>
                              <div
                                style={{ fontSize: "24px", fontWeight: 600 }}
                              >
                                {(typeof value === "number" &&
                                  key.includes("price")) ||
                                key.includes("salary") ||
                                key.includes("spent")
                                  ? `$${value.toLocaleString()}`
                                  : typeof value === "number" &&
                                      !Number.isInteger(value)
                                    ? value.toFixed(1)
                                    : value.toLocaleString()}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "30px",
                      }}
                    >
                      <div>
                        {analytics.departmentDistribution &&
                          renderBarChart(
                            analytics.departmentDistribution,
                            "Department Distribution",
                          )}
                        {analytics.categoryDistribution &&
                          renderBarChart(
                            analytics.categoryDistribution,
                            "Category Distribution",
                          )}
                        {analytics.countryDistribution &&
                          renderBarChart(
                            analytics.countryDistribution,
                            "Country Distribution",
                          )}
                      </div>

                      <div>
                        {analytics.salaryRanges &&
                          renderBarChart(
                            analytics.salaryRanges,
                            "Salary Distribution",
                          )}
                        {analytics.ageGroups &&
                          renderBarChart(
                            analytics.ageGroups,
                            "Age Distribution",
                          )}
                        {analytics.priceRanges &&
                          renderBarChart(
                            analytics.priceRanges,
                            "Price Distribution",
                          )}
                        {analytics.membershipTiers &&
                          renderBarChart(
                            analytics.membershipTiers,
                            "Membership Tiers",
                          )}
                        {analytics.acquisitionSources &&
                          renderBarChart(
                            analytics.acquisitionSources,
                            "Acquisition Sources",
                          )}
                      </div>
                    </div>
                  </>
                ) : null}
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
