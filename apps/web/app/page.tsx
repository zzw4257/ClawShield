import { HomeClient } from "../components/home-client";
import { loadCaseRegistry } from "../lib/cases-server";

export default function HomePage() {
  const registry = loadCaseRegistry();
  return <HomeClient demoCases={registry.cases} />;
}
