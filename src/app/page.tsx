import { redirect } from "next/navigation";

export default function RootPage() {
  // A raiz sempre leva ao dashboard. O middleware cuida de exigir autenticação
  // (redirecionando para /login quando necessário).
  redirect("/dashboard");
}
