function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>SIGA+ — Sistema Inteligente de Gestão Acadêmica</span>
        <span>IFAL • {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export default Footer;
