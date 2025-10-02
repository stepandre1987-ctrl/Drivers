// app/page.tsx
export const runtime = "nodejs"; // nevadí, i když nic Node-specifického nepoužijeme

export default async function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Drivers</h1>
      <p>Aplikace běží. Přihlášení najdeš na <a href="/api/auth/signin">/api/auth/signin</a>.</p>
    </main>
  );
}
