function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-400 sm:px-6 lg:px-8">
        <span>Siga-Plus</span>
        <span>IFAL • {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export default Footer;
