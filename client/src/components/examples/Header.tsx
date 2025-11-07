import Header from "../Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Header />
      </WalletProvider>
    </ThemeProvider>
  );
}
