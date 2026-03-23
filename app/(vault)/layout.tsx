import { VaultShell } from "@/components/vault/vault-shell";

export default function VaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <VaultShell>{children}</VaultShell>;
}
