/** Cortina verde que se levanta en cada cambio de página. Es CSS puro para que nunca tape la página si el JS tarda. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="curtain" />
      {children}
    </>
  );
}
