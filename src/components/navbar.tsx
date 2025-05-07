import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="logo">
        Voice-to-SQL
      </Link>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/query">SQL Query</Link>
        </li>
        <li>
          <Link href="/transcription">Transcription</Link>
        </li>
      </ul>
    </nav>
  );
}
