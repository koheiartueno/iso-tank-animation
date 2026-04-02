import IsoTankScroll from '@/components/IsoTankScroll';

export default function Home() {
  return (
    <main className="bg-transparent min-h-screen selection:bg-white/20 selection:text-black">
      <IsoTankScroll />

      <section className="h-screen w-full bg-transparent flex items-center justify-center border-t border-white/5">
        <p className="text-black/30 tracking-widest text-sm uppercase">Global Logistics Redefined</p>
      </section>
    </main>
  );
}
