import Link from "next/link";

export default function Hero() {
  return (
    <div className="header-text">
      <p>Voice-to-SQL Converter</p>
      <h1>
        Transform <span>Voice</span> into <span>SQL Queries</span>
      </h1>
      <p style={{ marginTop: "20px", marginBottom: "30px", maxWidth: "600px" }}>
        Speak naturally and get instant SQL code for your database queries
      </p>
      <Link href="/query" className="btn">
        Try It Now
      </Link>
    </div>
  );
}
