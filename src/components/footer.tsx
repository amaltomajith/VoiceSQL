export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#262626",
        padding: "25px 0",
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      <div className="container">
        <p>© {currentYear} Voice-to-SQL. All rights reserved.</p>
      </div>
    </footer>
  );
}
