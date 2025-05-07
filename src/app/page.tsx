import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
import { Mic, Code, Database, BarChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container">
        <Navbar />
        <Hero />

        {/* Features Section */}
        <section style={{ padding: "80px 0" }}>
          <h2
            style={{ fontSize: "40px", fontWeight: 600, marginBottom: "50px" }}
          >
            How It Works
          </h2>

          <div className="services-list">
            <div>
              <Mic size={40} color="#ff004f" />
              <h2>Speak Your Query</h2>
              <p>
                Just talk naturally about what data you need from your database
              </p>
            </div>

            <div>
              <Code size={40} color="#ff004f" />
              <h2>AI Generates SQL</h2>
              <p>
                Our AI converts your speech to precise SQL queries instantly
              </p>
            </div>

            <div>
              <Database size={40} color="#ff004f" />
              <h2>Query Your Data</h2>
              <p>Execute against your uploaded tables with one click</p>
            </div>

            <div>
              <BarChart size={40} color="#ff004f" />
              <h2>Natural Results</h2>
              <p>Get both data tables and plain English summaries</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: "50px 0", textAlign: "center" }}>
          <h2
            style={{ fontSize: "40px", fontWeight: 600, marginBottom: "20px" }}
          >
            Ready to Talk to Your Data?
          </h2>
          <p
            style={{
              marginBottom: "30px",
              maxWidth: "700px",
              margin: "0 auto 30px",
            }}
          >
            Start converting your voice to SQL queries and get insights in
            seconds.
          </p>
          <Link href="/query" className="btn" style={{ margin: "0 auto" }}>
            Try It Now
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  );
}
