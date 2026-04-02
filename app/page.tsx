import IsoTankScroll from '@/components/IsoTankScroll';

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen selection:bg-white/20 selection:text-white">
      <IsoTankScroll />

      <section className="h-screen w-full bg-[#050505] flex items-center justify-center border-t border-white/5">
        <p className="text-white/30 tracking-widest text-sm uppercase">Global Logistics Redefined</p>
      </section>
    </main>
  );
}
